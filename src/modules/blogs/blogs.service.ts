import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('blog-tasks') private blogQueue: Queue,
  ) {}

  async publishBlog(blogId: string) {
    const blog = await this.prisma.blog.update({
      where: { id: blogId },
      data: { published: true },
    });

    // Enqueue background job - Non-blocking
    await this.blogQueue.add('generate-summary', {
      blogId: blog.id,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });

    return blog;
  }

  /**
   * Optimized Public Feed Query
   * - Uses Cursor-based pagination for O(1) performance at scale
   * - Uses Prisma's _count to avoid N+1 count queries
   * - Uses select to minimize data transfer (Over-fetching prevention)
   * - Filters for published and non-deleted posts
   */
  async getPublicFeed(query: GetFeedDto) {
    const { limit, cursor } = query;

    const blogs = await this.prisma.blog.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor itself if it exists
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        published: true,
        deletedAt: null, // Soft-delete filter
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate next cursor for frontend
    const nextCursor = blogs.length === limit ? blogs[blogs.length - 1].id : null;

    return {
      data: blogs,
      meta: {
        nextCursor,
        count: blogs.length,
      },
    };
  }
}
