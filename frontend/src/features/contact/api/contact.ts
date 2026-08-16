import { apiRequest } from "@/lib/api";

export type CreateContact = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export type Contact = {
  id: string;
  createdAt: string;
};

export async function createContact(body: CreateContact): Promise<Contact> {
  return apiRequest<Contact>("/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAllContacts(): Promise<Contact[]> {
  return apiRequest<Contact[]>("/contact");
}