import { Controller, Get, Query, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogsService } from './blogs.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Controller('public')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Throttle({ medium: { limit: 30, ttl: 60000 } })
  @Get('feed')
  async getFeed(@Query() query: GetFeedDto) {
    return this.blogsService.getPublicFeed(query);
  }

  @Throttle({ medium: { limit: 60, ttl: 60000 } })
  @Get('blogs/:slug')
  async getBySlug(@Param('slug') slug: string) {
    // Implementation for fetching by slug
    return { slug, title: 'Example Blog' };
  }
}
