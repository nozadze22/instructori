import {
  Body,
  Controller,
  Header,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/auth_guard/optional-jwt-auth.guard';
import { RouteTtsDto } from './dto/route.dto';
import { TtsService } from './tts.service';

/** TTS without ACTIVE access gate — rehearsal / public catalog voice preview. */
@Controller('routes')
export class RoutesTtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('tts')
  @UseGuards(OptionalJwtAuthGuard)
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'private, max-age=3600')
  async speak(@Body() dto: RouteTtsDto) {
    const audio = await this.ttsService.synthesize(dto.text);
    return new StreamableFile(audio, {
      type: 'audio/mpeg',
      disposition: 'inline',
    });
  }
}
