import { Body, Controller, Post } from '@nestjs/common';
import type { Contact } from '../../generated/prisma/client';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(dto);
  }
}
