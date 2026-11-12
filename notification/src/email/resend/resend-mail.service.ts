import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export type OutboundMail = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

@Injectable()
export class ResendMailService {
  private readonly logger = new Logger(ResendMailService.name);
  private client: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  async send(mail: OutboundMail): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    const from = this.config.get<string>('RESEND_FROM')?.trim();

    if (!apiKey || !from) {
      this.logger.warn(
        'RESEND_API_KEY or RESEND_FROM unset — email not sent (dev only)',
      );
      this.logger.debug(
        `Would send to ${String(mail.to)}: ${mail.subject}`,
      );
      return;
    }

    const resend = this.getClient(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: mail.replyTo,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  private getClient(apiKey: string): Resend {
    if (!this.client) {
      this.client = new Resend(apiKey);
    }
    return this.client;
  }
}
