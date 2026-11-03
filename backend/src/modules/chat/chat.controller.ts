import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessGuard } from '../auth/auth_guard/access.guard';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import { ChatService } from './chat.service';
import { ChatMessagesQueryDto, SendChatMessageDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, AccessGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
  ) {}

  @Get('socket-token')
  async getSocketToken(@CurrentUser() user: AuthUser) {
    const session = await this.chatService.createSocketToken(user.userId);
    const token = this.jwt.sign(
      {
        sub: session.userId,
        purpose: 'chat',
        sv: session.sessionVersion,
      },
      { expiresIn: '2h' },
    );
    return { token };
  }

  @Get('conversations')
  listConversations(@CurrentUser() user: AuthUser) {
    return this.chatService.listConversations({
      userId: user.userId,
      role: user.role,
    });
  }

  @Get('conversations/:peerId/messages')
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param('peerId') peerId: string,
    @Query() query: ChatMessagesQueryDto,
  ) {
    return this.chatService.listMessages(
      { userId: user.userId, role: user.role },
      peerId,
      { limit: query.limit, beforeId: query.beforeId },
    );
  }

  @Post('conversations/:peerId/messages')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('peerId') peerId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(
      { userId: user.userId, role: user.role },
      peerId,
      dto.body,
    );
  }

  @Post('conversations/:peerId/read')
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('peerId') peerId: string,
  ) {
    return this.chatService.markRead(
      { userId: user.userId, role: user.role },
      peerId,
    );
  }

  @Post('conversations/:peerId/clear')
  clearForMe(
    @CurrentUser() user: AuthUser,
    @Param('peerId') peerId: string,
  ) {
    return this.chatService.clearForMe(
      { userId: user.userId, role: user.role },
      peerId,
    );
  }
}
