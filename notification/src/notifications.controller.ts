import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { readAccessToken } from './auth/auth-cookie';
import { CurrentUser } from './auth/current-user.decorator';
import type { AuthUser } from './auth/auth-types';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NotificationListQueryDto } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: NotificationListQueryDto,
  ) {
    return this.notifications.listForUser(user.userId, {
      filter: query.filter,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.notifications.unreadCount(user.userId);
  }

  /** Same-origin clients use this token for cross-host Socket.IO (Vercel → Fly). */
  @Get('socket-token')
  socketToken(@Req() req: Request) {
    const token = readAccessToken(req);
    if (!token) {
      throw new UnauthorizedException();
    }
    return { token };
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.userId);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notifications.markRead(user.userId, id);
  }
}
