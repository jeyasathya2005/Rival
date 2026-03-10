import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Redis / BullMQ Configuration
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    
    // Structured Logging
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),

    // Rate Limiting (Production-ready with named throttlers)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 20, // 20 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 100, // 100 requests per hour
      },
    ]),

    // Core Modules
    PrismaModule,
    AuthModule,
    BlogsModule,
    JobsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
