"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquareText, Send, Type, User } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useCreateContact } from "../hooks/conatct";

const defaultValues: ContactSchema = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

const inputGroupClassName =
  "h-12 rounded-xl border-white/10 bg-surface-lowest px-1 shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_15px_rgb(173_198_255_/_15%)]";

const addonClassName = "pl-3 pr-2";

export function ContactForm() {
  const { mutateAsync: createContact, isPending: isCreating } =
    useCreateContact();

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FieldGroup className="grid! grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel
              htmlFor="fullName"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              სახელი და გვარი
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon className={addonClassName}>
                  <User />
                </InputGroupAddon>
                <InputGroupInput
                  id="fullName"
                  placeholder="გიორგი ბერიძე"
                  autoComplete="name"
                  className="h-full"
                  {...form.register("fullName")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel
              htmlFor="email"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              ელ-ფოსტა
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon className={addonClassName}>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="giorgi@example.com"
                  autoComplete="email"
                  className="h-full"
                  {...form.register("email")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.email]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Field data-invalid={!!form.formState.errors.subject}>
          <FieldLabel
            htmlFor="subject"
            className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            თემა
          </FieldLabel>
          <FieldContent>
            <InputGroup className={inputGroupClassName}>
              <InputGroupAddon className={addonClassName}>
                <Type />
              </InputGroupAddon>
              <InputGroupInput
                id="subject"
                placeholder="სიმულატორის ტესტირება"
                className="h-full"
                {...form.register("subject")}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.subject]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.message}>
          <FieldLabel
            htmlFor="message"
            className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            შეტყობინება
          </FieldLabel>
          <FieldContent>
            <InputGroup
              className={`${inputGroupClassName} h-auto min-h-[10rem] items-start py-3`}
            >
              <InputGroupAddon className={`${addonClassName} pt-0.5`}>
                <MessageSquareText />
              </InputGroupAddon>
              <InputGroupTextarea
                id="message"
                rows={5}
                placeholder="როგორ შემიძლია დავჯავშნო პრაქტიკული მეცადინეობა?"
                className="min-h-[8.5rem] py-0 resize-none"
                {...form.register("message")}
              />
            </InputGroup>
            <FieldDescription>
              პასუხს მიიღებთ სამუშაო საათებში მაქსიმუმ 24 საათში.
            </FieldDescription>
            <FieldError errors={[form.formState.errors.message]} />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          className="h-14 w-full rounded-xl text-base font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]"
          disabled={form.formState.isSubmitting || isCreating}
        >
          გაგზავნა
          <Send data-icon="inline-end" className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
