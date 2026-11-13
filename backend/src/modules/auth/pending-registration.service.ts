import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { PendingRegistration, PendingRegistrationKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailClientService } from '../email-client/email-client.service';
import { findInstructorByCodeForStudentLink } from '../profile/instructor-code.util';
import type { RegisterDto, RegisterStudentDto } from './dto/auth.dto';
import type { EmailVerificationPendingResponse } from './dto/registration-result';
import { buildVerificationEmailContent } from './email-verification-content';

export type InstructorPendingPayload = {
  city: string;
  phone: string;
  instructorCategories: string[];
};

export type StudentPendingPayload = {
  phone: string;
  linkedInstructorId?: string;
};

@Injectable()
export class PendingRegistrationService {
  private readonly logger = new Logger(PendingRegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailClient: EmailClientService,
  ) {}

  async beginInstructorRegistration(
    dto: RegisterDto,
  ): Promise<EmailVerificationPendingResponse> {
    const city = dto.city.trim();
    const activeCity = await this.prisma.examRegion.findFirst({
      where: { name: city },
      select: { id: true },
    });
    if (!activeCity) {
      throw new BadRequestException(
        'არჩეული ქალაქი აქტიური არ არის',
      );
    }

    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const payload: InstructorPendingPayload = {
      city,
      phone: dto.phone.trim(),
      instructorCategories: dto.instructorCategories,
    };

    await this.upsertPending({
      email,
      fullName: dto.fullName.trim(),
      passwordHash,
      kind: 'INSTRUCTOR',
      payload,
    });

    return { needsEmailVerification: true, email };
  }

  async beginStudentRegistration(
    dto: RegisterStudentDto,
  ): Promise<EmailVerificationPendingResponse> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);

    const instructorCode = dto.instructorCode?.trim().toUpperCase();
    let linkedInstructorId: string | undefined;
    if (instructorCode) {
      const instructor = await findInstructorByCodeForStudentLink(
        this.prisma,
        instructorCode,
      );
      linkedInstructorId = instructor.id;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const payload: StudentPendingPayload = {
      phone: dto.phone.trim(),
      ...(linkedInstructorId ? { linkedInstructorId } : {}),
    };

    await this.upsertPending({
      email,
      fullName: dto.fullName.trim(),
      passwordHash,
      kind: 'STUDENT',
      payload,
    });

    return { needsEmailVerification: true, email };
  }

  async findValidByToken(token: string): Promise<PendingRegistration | null> {
    const tokenHash = this.hashToken(token.trim());
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { tokenHash },
    });
    if (!pending) {
      return null;
    }
    if (pending.expiresAt.getTime() <= Date.now()) {
      await this.prisma.pendingRegistration.delete({ where: { id: pending.id } });
      return null;
    }
    return pending;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.pendingRegistration.delete({ where: { id } });
  }

  async resendVerification(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email: normalized },
    });
    if (!pending || pending.expiresAt.getTime() <= Date.now()) {
      if (pending) {
        await this.prisma.pendingRegistration.delete({ where: { id: pending.id } });
      }
      throw new NotFoundException('No pending registration for this email');
    }

    const rawToken = this.generateToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.expiresAt();

    await this.prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: { tokenHash, expiresAt },
    });

    await this.sendVerificationEmail({
      email: pending.email,
      fullName: pending.fullName,
      token: rawToken,
    });
  }

  async hasActivePending(email: string): Promise<boolean> {
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
      select: { expiresAt: true },
    });
    return Boolean(pending && pending.expiresAt.getTime() > Date.now());
  }

  parseInstructorPayload(pending: PendingRegistration): InstructorPendingPayload {
    return pending.payload as InstructorPendingPayload;
  }

  parseStudentPayload(pending: PendingRegistration): StudentPendingPayload {
    return pending.payload as StudentPendingPayload;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
  }

  private async upsertPending(input: {
    email: string;
    fullName: string;
    passwordHash: string;
    kind: PendingRegistrationKind;
    payload: InstructorPendingPayload | StudentPendingPayload;
  }): Promise<void> {
    const rawToken = this.generateToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.expiresAt();

    await this.prisma.pendingRegistration.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        fullName: input.fullName,
        passwordHash: input.passwordHash,
        kind: input.kind,
        payload: input.payload,
        tokenHash,
        expiresAt,
      },
      update: {
        fullName: input.fullName,
        passwordHash: input.passwordHash,
        kind: input.kind,
        payload: input.payload,
        tokenHash,
        expiresAt,
      },
    });

    await this.sendVerificationEmail({
      email: input.email,
      fullName: input.fullName,
      token: rawToken,
    });
  }

  private async sendVerificationEmail(input: {
    email: string;
    fullName: string;
    token: string;
  }): Promise<void> {
    const link = this.verificationUrl(input.token);
    const hours = this.ttlHours();
    const siteUrl =
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      'http://localhost:3001';
    const { html, text } = buildVerificationEmailContent({
      fullName: input.fullName,
      verificationLink: link,
      ttlHours: hours,
      siteUrl,
    });

    try {
      await this.emailClient.sendRaw({
        to: input.email,
        subject: 'დაადასტურე ელფოსტა — SimDrive Pro',
        text,
        html,
      });
    } catch (error) {
      this.logger.warn(
        `Verification email failed for ${input.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private verificationUrl(token: string): string {
    const base =
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      'http://localhost:3001';
    const root = base.replace(/\/$/, '');
    return `${root}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private ttlHours(): number {
    const raw = Number(this.config.get('EMAIL_VERIFICATION_TTL_HOURS') ?? 24);
    return Number.isFinite(raw) && raw > 0 ? raw : 24;
  }

  private expiresAt(): Date {
    return new Date(Date.now() + this.ttlHours() * 60 * 60 * 1000);
  }

  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

}
