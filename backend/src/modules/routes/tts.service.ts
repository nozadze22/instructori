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
const TTS_RATE_MAX = 30;
/** Bump when the provider/model/voice changes so cached audio is regenerated. */
const TTS_PROFILE = 'v7-prod-reliable';

const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

/** Punctuation + spacing so TTS does not run words together. */
function prepareNavigationVoiceText(raw: string): string {
  let text = raw.trim().replace(/\s+/g, ' ');
  text = text.replace(/(\d+)\s*(მეტრ)/giu, '$1 $2');
  text = text.replace(/(\d+)\s*(მეტრში|სმ|კმ)/giu, '$1 $2');
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

type ElevenLabsBody = {
  text: string;
  model_id: string;
  voice_settings: Record<string, number | boolean>;
};

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
        'ElevenLabs TTS კონფიგურირებული არ არის (Fly: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID).',
      );
    }

    const attempts = this.buildElevenLabsAttempts(normalized);
    let lastError: string | null = null;

    for (const attempt of attempts) {
      try {
        const buffer = await this.synthesizeElevenLabs(
          elevenLabsKey,
          elevenLabsVoiceId,
          attempt,
        );
        this.remember(key, buffer);
        this.logger.log(
          `ElevenLabs TTS ok [${attempt.label}] (${normalized.length} chars → ${buffer.length} bytes)`,
        );
        return buffer;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `ElevenLabs TTS attempt failed [${attempt.label}]: ${lastError}`,
        );
      }
    }

    this.logger.error(
      `ElevenLabs TTS exhausted (${normalized.length} chars): ${lastError ?? 'unknown'}`,
    );
    throw new ServiceUnavailableException(
      'ElevenLabs-ის ხმის გენერაცია დროებით ვერ მოხერხდა. სცადე ხელახლა.',
    );
  }

  private buildElevenLabsAttempts(text: string): Array<{
    label: string;
    body: ElevenLabsBody;
    outputFormat: string;
  }> {
    const modelPrimary =
      process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2';
    const modelFallback =
      process.env.ELEVENLABS_MODEL_FALLBACK?.trim() || 'eleven_v2';

    const voiceFull: Record<string, number | boolean> = {
      stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.72),
      similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY ?? 0.78),
      use_speaker_boost: true,
    };
    const style = Number(process.env.ELEVENLABS_STYLE ?? 0);
    if (style > 0) {
      voiceFull.style = style;
    }
    const speedRaw = process.env.ELEVENLABS_SPEED?.trim();
    if (speedRaw) {
      voiceFull.speed = Number(speedRaw);
    }

    const voiceSafe: Record<string, number | boolean> = {
      stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.65),
      similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY ?? 0.75),
      use_speaker_boost: true,
    };

    return [
      {
        label: modelPrimary,
        body: { text, model_id: modelPrimary, voice_settings: voiceFull },
        outputFormat:
          process.env.ELEVENLABS_OUTPUT_FORMAT?.trim() || DEFAULT_OUTPUT_FORMAT,
      },
      {
        label: `${modelPrimary}-safe`,
        body: { text, model_id: modelPrimary, voice_settings: voiceSafe },
        outputFormat: DEFAULT_OUTPUT_FORMAT,
      },
      {
        label: modelFallback,
        body: { text, model_id: modelFallback, voice_settings: voiceSafe },
        outputFormat: DEFAULT_OUTPUT_FORMAT,
      },
    ];
  }

  private async synthesizeElevenLabs(
    apiKey: string,
    voiceId: string,
    attempt: {
      label: string;
      body: ElevenLabsBody;
      outputFormat: string;
    },
  ): Promise<Buffer> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(attempt.outputFormat)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify(attempt.body),
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
