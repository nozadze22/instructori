import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { Readable } from 'stream';

const MAX_TEXT_LENGTH = 500;
const TTS_TIMEOUT_MS = 20_000;
const CACHE_LIMIT = 80;
const GEORGIAN_VOICE = 'ka-GE-EkaNeural';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly cache = new Map<string, Buffer>();

  async synthesize(text: string): Promise<Buffer> {
    const normalized = text.trim();
    if (!normalized) {
      throw new BadRequestException('ტექსტი ცარიელია');
    }
    if (normalized.length > MAX_TEXT_LENGTH) {
      throw new BadRequestException('ტექსტი ძალიან გრძელია');
    }

    const key = createHash('sha1').update(normalized).digest('hex');
    const cached = this.cache.get(key);
    if (cached) return cached;

    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(
        GEORGIAN_VOICE,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      );

      const { audioStream } = tts.toStream(normalized);
      const buffer = await this.readStream(audioStream);

      if (buffer.length < 64) {
        throw new Error('ცარიელი აუდიო პასუხი');
      }

      this.remember(key, buffer);
      return buffer;
    } catch (error) {
      this.logger.error(
        `TTS failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    } finally {
      tts.close();
    }
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

  private readStream(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timer = setTimeout(() => {
        stream.destroy();
        reject(new Error('TTS timeout'));
      }, TTS_TIMEOUT_MS);

      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.once('end', () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks));
      });
      stream.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
}
