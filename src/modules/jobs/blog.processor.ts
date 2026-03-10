import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Processor('blog-tasks')
export class BlogProcessor extends WorkerHost {
  private readonly logger = new Logger(BlogProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'generate-summary':
        return this.handleGenerateSummary(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleGenerateSummary(data: { blogId: string }) {
    const { blogId } = data;
    this.logger.log(`Starting summary generation for blog: ${blogId}`);

    try {
      // 1. Fetch blog content
      const blog = await this.prisma.blog.findUnique({
        where: { id: blogId },
      });

      if (!blog) {
        this.logger.error(`Blog not found: ${blogId}`);
        return;
      }

      // 2. Generate summary (Simulated logic or AI call)
      const summary = blog.content.substring(0, 200) + '...';

      // 3. Store summary (Assuming a summary field exists or in a separate table)
      // For this demo, we'll just log it or update a hypothetical field
      this.logger.log(`Summary generated for ${blogId}: ${summary}`);
      
      // await this.prisma.blog.update({
      //   where: { id: blogId },
      //   data: { summary },
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to generate summary for ${blogId}`, error.stack);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} of type ${job.name} failed: ${error.message}`);
  }
}
