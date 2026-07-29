"use client";


import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  contactSchema,
  type ContactSchema,
} from "@/features/contact/schemas/conatct.schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContact } from "../hooks/conatct";

const defaultValues: ContactSchema = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {

  const { mutateAsync: createContact, isPending: isCreating } = useCreateContact();

  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: ContactSchema) => {
    await createContact(values);
    form.reset(defaultValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="fullName">სახელი და გვარი</FieldLabel>
            <FieldContent>
              <Input
                id="fullName"
                placeholder="გიორგი ბერიძე"
                className="h-11 rounded-xl bg-surface-lowest"
                {...form.register("fullName")}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">ელ-ფოსტა</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="giorgi@example.com"
                className="h-11 rounded-xl bg-surface-lowest"
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Field data-invalid={!!form.formState.errors.subject}>
          <FieldLabel htmlFor="subject">თემა</FieldLabel>
          <FieldContent>
            <Input
              id="subject"
              placeholder="სიმულატორის ტესტირება"
              className="h-11 rounded-xl bg-surface-lowest"
              {...form.register("subject")}
            />
            <FieldError errors={[form.formState.errors.subject]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.message}>
          <FieldLabel htmlFor="message">შეტყობინება</FieldLabel>
          <FieldContent>
            <Textarea
              id="message"
              rows={6}
              placeholder="როგორ შემიძლია დავჯავშნო პრაქტიკული მეცადინეობა?"
              className="rounded-xl bg-surface-lowest"
              {...form.register("message")}
            />
            <FieldDescription>
              პასუხს მიიღებთ სამუშაო საათებში მაქსიმუმ 24 საათში.
            </FieldDescription>
            <FieldError errors={[form.formState.errors.message]} />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary font-bold text-on-primary-container hover:brightness-110"
          disabled={form.formState.isSubmitting || isCreating}
        >
          გაგზავნა
          <Send className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
