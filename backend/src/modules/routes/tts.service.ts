import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'crypto';

const MAX_TEXT_LENGTH = 500;
const TTS_TIMEOUT_MS = 20_000;
const CACHE_LIMIT = 80;
const TTS_RATE_WINDOW_MS = 60_000;
const TTS_RATE_MAX = 10;
/** Bump when the provider/model/voice changes so cached audio is regenerated. */
const TTS_PROFILE = 'v6-clear-georgian';

/** Punctuation + spacing so TTS does not run words together. */
function prepareNavigationVoiceText(raw: string): string {
  let text = raw.trim().replace(/\s+/g, ' ');
  text = text.replace(/(\d+)\s*(მეტრ)/giu, '$1 $2');
  text = text.replace(
    /(\d+)\s*(მეტრში|სმ|კმ)/giu,
    '$1 $2',
  );
  text = text.replace(
    /\s+(მოუხვიეთ|გადადით|გაგრძელებით|გთხოვთ|მალე|შემდეგ|პირდაპირ)/giu,
    '. $1',
  );
  text = text.replace(/\.{2,}/g, '.');
  text = text.replace(/\.\s*\./g, '.');
  if (!/[.!?]$/.test(text)) {
    text = `${text}.`;
  }
  return text;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly cache = new Map<string, Buffer>();
  private readonly rateWindows = new Map<
    string,
    { count: number; resetAt: number }
  >();

  async synthesize(userId: string, text: string): Promise<Buffer> {
    this.assertRateLimit(userId);
    const normalized = prepareNavigationVoiceText(text);
    if (!normalized) {
      throw new BadRequestException('ტექსტი ცარიელია');
    }
    if (normalized.length > MAX_TEXT_LENGTH) {
      throw new BadRequestException('ტექსტი ძალიან გრძელია');
    }

    const key = createHash('sha1')
      .update(`${TTS_PROFILE}:${normalized}`)
      .digest('hex');
    const cached = this.cache.get(key);
    if (cached) return cached;

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim();
    const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
    if (!elevenLabsKey || !elevenLabsVoiceId) {
      throw new ServiceUnavailableException(
        'ElevenLabs TTS კონფიგურირებული არ არის: დაამატე ELEVENLABS_API_KEY და ELEVENLABS_VOICE_ID backend/.env-ში.',
      );
    }

    try {
      const buffer = await this.synthesizeElevenLabs(
        normalized,
        elevenLabsKey,
        elevenLabsVoiceId,
      );
      this.remember(key, buffer);
      this.logger.log(
        `ElevenLabs TTS ok (${normalized.length} chars → ${buffer.length} bytes)`,
      );
      return buffer;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `ElevenLabs TTS failed (${normalized.length} chars): ${msg}`,
      );
    }
    throw new ServiceUnavailableException(
      'ElevenLabs-ის ხმის გენერაცია დროებით ვერ მოხერხდა. სცადე ხელახლა.',
    );
  }

  private async synthesizeElevenLabs(
    text: string,
    apiKey: string,
    voiceId: string,
  ): Promise<Buffer> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_192`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            text,
            model_id:
              process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2',
            voice_settings: {
              // Higher stability = clearer syllables, less “swallowed” endings.
              stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.72),
              similarity_boost: Number(
                process.env.ELEVENLABS_SIMILARITY ?? 0.78,
              ),
              style: Number(process.env.ELEVENLABS_STYLE ?? 0),
              use_speaker_boost: true,
              speed: Number(process.env.ELEVENLABS_SPEED ?? 0.96),
            },
          }),
        },
      );

      const body = Buffer.from(await response.arrayBuffer());
      if (!response.ok) {
        throw new Error(`${response.status} ${body.toString('utf8').slice(0, 280)}`);
      }
      if (body.length < 64) {
        throw new Error('ElevenLabs returned empty audio');
      }
      return body;
    } finally {
      clearTimeout(timer);
    }
  }

  private assertRateLimit(userId: string) {
    const now = Date.now();
    const current = this.rateWindows.get(userId);
    if (!current || current.resetAt <= now) {
      this.rateWindows.set(userId, {
        count: 1,
        resetAt: now + TTS_RATE_WINDOW_MS,
      });
      return;
    }
    if (current.count >= TTS_RATE_MAX) {
      throw new HttpException(
        'ხმის გენერაცია ძალიან ხშირია. სცადე ერთი წუთის შემდეგ.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    current.count += 1;
  }

  private remember(key: string, buffer: Buffer) {
    if (this.cache.size >= CACHE_LIMIT) {
      for (const oldest of this.cache.keys()) {
        this.cache.delete(oldest);
        break;
      }
    }
    this.cache.set(key, buffer);
  }

}
