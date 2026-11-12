import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emailRoutingKey, type EmailEventPath } from '@instructor/messaging';
import { buildBroadcastEmailContent } from './broadcast-email-content';
import { ResendMailService } from './resend/resend-mail.service';

@Injectable()
export class EmailDispatchService {
  private readonly logger = new Logger(EmailDispatchService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mail: ResendMailService,
  ) {}

  async dispatch(
    routingKey: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const path = this.routingKeyToPath(routingKey);
    if (!path) {
      return;
    }

    switch (path) {
      case 'send':
        await this.mail.send({
          to: this.requireString(payload.to),
          subject: String(payload.subject),
          text: String(payload.text),
          html: payload.html as string | undefined,
          replyTo: payload.replyTo as string | undefined,
        });
        return;
      case 'access-pending':
        await this.mail.send(this.accessPendingTemplate(payload));
        return;
      case 'access-granted':
        await this.mail.send(this.accessGrantedTemplate(payload));
        return;
      case 'contact-admin':
        await this.mail.send(this.contactAdminTemplate(payload));
        return;
      case 'admin-broadcast':
        await this.dispatchAdminBroadcast(payload);
        return;
      default:
        return;
    }
  }

  private async dispatchAdminBroadcast(
    payload: Record<string, unknown>,
  ): Promise<void> {
    const subject = this.coerceString(payload.subject).trim();
    const body = this.coerceString(payload.body).trim();
    const siteUrl =
      this.coerceString(payload.siteUrl).trim() || this.frontendUrl();
    const recipients = this.parseAdminBroadcastRecipients(payload.recipients);

    if (!subject || !body || recipients.length === 0) {
      this.logger.warn('admin-broadcast: invalid or empty payload');
      return;
    }

    for (const { email, fullName } of recipients) {
      const { html, text } = buildBroadcastEmailContent({
        recipientName: fullName,
        subject,
        body,
        siteUrl,
      });

      try {
        await this.mail.send({ to: email, subject, text, html });
      } catch (error: unknown) {
        const reason =
          error instanceof Error ? error.message : 'send failed';
        this.logger.warn(`admin-broadcast failed for ${email}: ${reason}`);
      }
    }
  }

  private parseAdminBroadcastRecipients(
    value: unknown,
  ): Array<{ email: string; fullName: string }> {
    if (!Array.isArray(value)) {
      return [];
    }

    const recipients: Array<{ email: string; fullName: string }> = [];
    for (const entry of value) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const row = entry as Record<string, unknown>;
      const email = this.coerceString(row.email).trim();
      const fullName = this.coerceString(row.fullName).trim();
      if (!email) {
        continue;
      }
      recipients.push({ email, fullName });
    }
    return recipients;
  }

  private coerceString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return `${value}`;
    }
    return '';
  }

  private accessPendingTemplate(payload: Record<string, unknown>) {
    const fullName = String(payload.fullName);
    const site = this.frontendUrl();
    const text = [
      `გამარჯობა, ${fullName}!`,
      '',
      'თქვენი ინსტრუქტორის ანგარიში მიღებულია და ადმინისტრატორის დამტკიცებას ელოდება.',
      'აპში შეხვალთ, მაგრამ სრული ფუნქციები მიღებული წვდომის შემდეგ გაიხსნება.',
      site ? `პლატფორმა: ${site}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      to: String(payload.to),
      subject: 'ანგარიში მოლოდინშია — Instructorebi',
      text,
      html: `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
    };
  }

  private accessGrantedTemplate(payload: Record<string, unknown>) {
    const fullName = String(payload.fullName);
    const site = this.frontendUrl();
    const text = [
      `გამარჯობა, ${fullName}!`,
      '',
      'თქვენი ანგარიშის წვდომა დაამტკიცეს. შეგიძლიათ სრულად გამოიყენოთ პლატფორმა.',
      site ? `შესვლა: ${site}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      to: String(payload.to),
      subject: 'ანგარიში დაამტკიცეს — Instructorebi',
      text,
      html: `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
    };
  }

  private contactAdminTemplate(payload: Record<string, unknown>) {
    const fromName = String(payload.fullName);
    const fromEmail = String(payload.email);
    const subject = String(payload.subject);
    const message = String(payload.message);

    const text = [
      'ახალი კონტაქტის ფორმა',
      '',
      `სახელი: ${fromName}`,
      `ელფოსტა: ${fromEmail}`,
      `თემა: ${subject}`,
      '',
      message,
    ].join('\n');

    return {
      to: this.requireString(payload.to),
      subject: `[კონტაქტი] ${subject}`,
      text,
      replyTo: fromEmail,
    };
  }

  private frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL')?.trim().replace(/\/$/, '') || ''
    );
  }

  private requireString(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(String).join(',');
    }
    return String(value);
  }

  private routingKeyToPath(routingKey: string): EmailEventPath | null {
    const paths: EmailEventPath[] = [
      'send',
      'access-pending',
      'access-granted',
      'contact-admin',
      'admin-broadcast',
    ];
    for (const path of paths) {
      if (routingKey === emailRoutingKey(path)) {
        return path;
      }
    }
    return null;
  }
}
