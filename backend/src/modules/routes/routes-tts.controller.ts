import {
  Body,
  Controller,
  Header,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import { RouteTtsDto } from './dto/route.dto';
import { TtsService } from './tts.service';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesTtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('tts')
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'private, max-age=3600')
  async speak(@CurrentUser() user: AuthUser, @Body() dto: RouteTtsDto) {
    const audio = await this.ttsService.synthesize(user.userId, dto.text);
    return new StreamableFile(audio, {
      type: 'audio/mpeg',
      disposition: 'inline',
    });
  }
}
