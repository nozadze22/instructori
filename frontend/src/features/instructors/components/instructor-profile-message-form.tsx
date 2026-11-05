"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSendInstructorMessage } from "@/features/instructors/hooks/instructors";
import {
  instructorMessageSchema,
  type InstructorMessageSchema,
} from "@/features/instructors/schema/instructor-message.schema";

export function InstructorProfileMessageForm({
  instructorId,
  compact = false,
}: {
  instructorId: string;
  compact?: boolean;
}) {
  const { mutateAsync: sendMessage, isPending } =
    useSendInstructorMessage(instructorId);
  const form = useForm<InstructorMessageSchema>({
    resolver: zodResolver(instructorMessageSchema),
    defaultValues: { message: "" },
  });

  const onSubmit = async (values: InstructorMessageSchema) => {
    await sendMessage(values.message);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={compact ? "space-y-3" : "mt-5 space-y-3"}
        noValidate
      >
        <Field data-invalid={!!form.formState.errors.message}>
          {!compact ? (
            <FieldLabel htmlFor="instructor-message">
              შეტყობინება ინსტრუქტორს
            </FieldLabel>
          ) : null}
          <FieldContent>
            <InputGroup className="h-auto min-h-32 items-start rounded-xl border-white/10 bg-surface-container py-2">
              <InputGroupAddon className="pt-1">
                <Send />
              </InputGroupAddon>
              <InputGroupTextarea
                id="instructor-message"
                rows={4}
                placeholder="მაგ: მინდა რუსთავის მოედანზე დავიწყო..."
                className="min-h-24 resize-none"
                {...form.register("message")}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.message]} />
          </FieldContent>
        </Field>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full rounded-xl"
        >
          {isPending ? "იგზავნება..." : "შეტყობინების გაგზავნა"}
        </Button>
      </form>
    </Form>
  );
}
