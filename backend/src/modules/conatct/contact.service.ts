import { Injectable } from '@nestjs/common';
import type { Contact } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/contact.dto';

type ContactSelect = {
  id: true;
  fullName: true;
  email: true;
  subject: true;
  message: true;
  createdAt: true;
};

type ContactCreateArgs = {
  data: Pick<CreateContactDto, 'fullName' | 'email' | 'message'>;
  select: ContactSelect;
};

type ContactFindManyArgs = {
  select: ContactSelect;
  orderBy: { createdAt: 'desc' };
};

type ContactDelegate = {
  create: (args: ContactCreateArgs) => Promise<Contact>;
  findMany: (args: ContactFindManyArgs) => Promise<Contact[]>;
};

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService & { contact: ContactDelegate },
  ) {}

  create(dto: CreateContactDto): Promise<Contact> {
    return this.prisma.contact.create({
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
