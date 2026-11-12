import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { InternalModule } from './internal/internal.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    NotificationsModule,
    MessagingModule,
    InternalModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
