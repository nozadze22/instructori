import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SiteverifyResponse = {
  success: boolean;
  'error-codes'?: string[];
};

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.config.get<string>('TURNSTILE_SECRET_KEY')?.trim());
  }

  async verify(token: string | undefined, remoteIp?: string): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const response = token?.trim();
    if (!response) {
      throw new BadRequestException('captcha verification required');
    }

    const secret = this.config.getOrThrow<string>('TURNSTILE_SECRET_KEY').trim();
    const body = new URLSearchParams({
      secret,
      response,
    });
    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    let data: SiteverifyResponse;
    try {
      const res = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
      );
      data = (await res.json()) as SiteverifyResponse;
    } catch (error) {
      this.logger.error('Turnstile siteverify request failed', error);
      throw new BadRequestException('captcha verification failed');
    }

    if (!data.success) {
      this.logger.warn(
        `Turnstile rejected: ${data['error-codes']?.join(', ') ?? 'unknown'}`,
      );
      throw new BadRequestException('captcha verification failed');
    }
  }
}
