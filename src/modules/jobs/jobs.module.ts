import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlogProcessor } from './blog.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'blog-tasks',
    }),
  ],
  providers: [BlogProcessor],
  exports: [BullModule],
})
export class JobsModule {}
