import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Contact } from '@prisma/client';
import type { Request } from 'express';
import { TurnstileService } from '../../lib/turnstile/turnstile.service';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateContactDto,
    @Req() req: Request,
  ): Promise<Contact> {
    await this.turnstile.verify(dto.turnstileToken, req.ip);
    return this.contactService.create(dto);
  }
}
