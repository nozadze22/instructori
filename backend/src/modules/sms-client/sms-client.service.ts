import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_TEXTBEE_BASE = 'https://api.textbee.dev/api/v1';
const DEFAULT_PREFIX = 'Instructorebi:';

type SendSmsPayload = {
  recipients: string[];
  message: string;
};

@Injectable()
export class SmsClientService {
  private readonly logger = new Logger(SmsClientService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.apiKey() && this.adminNotifyPhone());
  }

  notifyAdminInstructorRegistered(input: {
    fullName: string;
    email: string;
    city: string;
  }): void {
    const adminPhone = this.adminNotifyPhone();
    if (!this.apiKey() || !adminPhone) {
      this.logger.debug(
        'SMS disabled — set SMS_API_KEY and ADMIN_NOTIFY_SMS to notify admin',
      );
      return;
    }

    const body = [
      `${this.messagePrefix()} ახალი ინსტრუქტორი.`,
      input.fullName,
      `${input.city} · ${input.email}`,
      'შეამოწმე ადმინში.',
    ].join(' ');

    void this.sendSms({ recipients: [adminPhone], message: body });
  }

  private async sendSms(payload: SendSmsPayload): Promise<void> {
    const apiKey = this.apiKey();
    if (!apiKey) return;

    const url = `${this.baseUrl()}/gateway/send-sms`;
    const body: Record<string, unknown> = {
      recipients: payload.recipients,
      message: payload.message,
    };

    const deviceId = this.config.get<string>('TEXTBEE_DEVICE_ID')?.trim();
    if (deviceId) {
      body.deviceId = deviceId;
    }

    const simSlot = this.config.get<string>('TEXTBEE_SIM_SLOT_INDEX')?.trim();
    if (simSlot !== undefined && simSlot !== '') {
      const parsed = Number(simSlot);
      if (Number.isInteger(parsed) && parsed >= 0) {
        body.simSlotIndex = parsed;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'User-Agent': 'instructorebi-backend/1.0',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(
          `TextBee send failed ${response.status}: ${text.slice(0, 240)}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `TextBee send error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private apiKey(): string | undefined {
    return (
      this.config.get<string>('SMS_API_KEY')?.trim() ||
      this.config.get<string>('TEXTBEE_API_KEY')?.trim()
    );
  }

  private adminNotifyPhone(): string | undefined {
    const raw =
      this.config.get<string>('ADMIN_NOTIFY_SMS')?.trim() ||
      this.config.get<string>('ADMIN_SMS_PHONE')?.trim();
    if (!raw) return undefined;
    return normalizePhoneE164(raw);
  }

  private messagePrefix(): string {
    const raw = this.config.get<string>('SMS_SENDER_PREFIX')?.trim();
    if (!raw) return DEFAULT_PREFIX;
    return raw.endsWith(':') || raw.endsWith('：') ? raw : `${raw}:`;
  }

  private baseUrl(): string {
    const raw = this.config.get<string>('TEXTBEE_BASE_URL')?.trim();
    if (!raw) return DEFAULT_TEXTBEE_BASE;
    return raw.replace(/\/$/, '');
  }
}

/** Best-effort E.164 for TextBee (Georgia defaults to +995). */
export function normalizePhoneE164(raw: string): string {
  const compact = raw.replace(/[\s\-()]/g, '');
  if (compact.startsWith('+')) {
    return compact;
  }
  if (compact.startsWith('00')) {
    return `+${compact.slice(2)}`;
  }
  if (compact.startsWith('995')) {
    return `+${compact}`;
  }
  if (/^5\d{8}$/.test(compact)) {
    return `+995${compact}`;
  }
  return `+${compact}`;
}