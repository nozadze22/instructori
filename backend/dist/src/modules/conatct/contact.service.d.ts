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
    orderBy: {
        createdAt: 'desc';
    };
};
type ContactDelegate = {
    create: (args: ContactCreateArgs) => Promise<Contact>;
    findMany: (args: ContactFindManyArgs) => Promise<Contact[]>;
};
export declare class ContactService {
    private readonly prisma;
    constructor(prisma: PrismaService & {
        contact: ContactDelegate;
    });
    create(dto: CreateContactDto): Promise<Contact>;
    getAllContact(): Promise<Contact[]>;
}
export {};
