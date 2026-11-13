import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatClientModule } from './modules/chat-client/chat-client.module';
import { ChatInternalModule } from './modules/chat-internal/chat-internal.module';
import { ContactModule } from './modules/conatct/contanct.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DrivingSessionsModule } from './modules/driving-sessions/driving-sessions.module';
import { InstructorsModule } from './modules/instructors/instructors.module';
import { MistakeCatalogModule } from './modules/mistake-catalog/mistake-catalog.module';
import { InstructorNotesModule } from './modules/instructor-notes/instructor-notes.module';
import { InstructorReviewsModule } from './modules/instructor-reviews/instructor-reviews.module';
import { MistakeNotesModule } from './modules/mistake-notes/mistake-notes.module';
import { EmailClientModule } from './modules/email-client/email-client.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationClientModule } from './modules/notification-client/notification-client.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RoutesModule } from './modules/routes/routes.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { TurnstileModule } from './lib/turnstile/turnstile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TurnstileModule,
    MessagingModule,
    EmailClientModule,
    NotificationClientModule,
    ChatClientModule,
    PrismaModule,
    RedisModule,
    StorageModule,
    ContactModule,
    AuthModule,
    ChatInternalModule,
    DashboardModule,
    InstructorsModule,
    ProfileModule,
    RoutesModule,
    MistakeNotesModule,
    InstructorNotesModule,
    InstructorReviewsModule,
    DrivingSessionsModule,
    MistakeCatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
