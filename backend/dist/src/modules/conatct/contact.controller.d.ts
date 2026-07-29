import type { Contact } from '../../generated/prisma/client';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactDto): Promise<Contact>;
}
