import { Injectable } from '@nestjs/common';
import type { Contact } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailClientService } from '../email-client/email-client.service';
import { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailClient: EmailClientService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = await this.prisma.contact.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        subject: true,
        message: true,
        createdAt: true,
      },
    });

    void this.emailClient.sendContactAdmin({
      fullName: contact.fullName,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    });

    return contact;
  }

  getAllContact(): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        subject: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
