import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessGuard } from './auth/access.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CurrentUser } from './auth/current-user.decorator';
import type { AuthUser } from './auth/auth-types';
import { CHAT_SOCKET_TOKEN_EXPIRES_IN, getChatJwtSecret } from './chat-jwt';
import { ChatService } from './chat.service';
import { ChatMessagesQueryDto, SendChatMessageDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, AccessGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
      {
        secret: getChatJwtSecret(this.config),
        expiresIn: CHAT_SOCKET_TOKEN_EXPIRES_IN,
      },
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
