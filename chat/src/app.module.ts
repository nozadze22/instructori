import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat.module';
import { HealthController } from './health.controller';
import { InternalModule } from './internal/internal.module';
import { MessagingModule } from './messaging/messaging.module';
import { MainApiModule } from './main-api/main-api.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    MainApiModule,
    AuthModule,
    ChatModule,
    MessagingModule,
    InternalModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
