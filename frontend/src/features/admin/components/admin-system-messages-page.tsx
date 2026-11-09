"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

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
import { useBroadcastSystemMessage } from "@/features/admin/hooks/system-messages";
import {
  broadcastSystemMessageSchema,
  defaultBroadcastSystemMessageValues,
  type BroadcastSystemMessageSchema,
} from "@/features/admin/schema/system-message.schema";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import {
  systemMessageCallout,
  systemMessageIconBox,
} from "@/lib/system-message-ui";
import { cn } from "@/lib/utils";

export function AdminSystemMessagesPage() {
  const broadcast = useBroadcastSystemMessage();
  const form = useForm<BroadcastSystemMessageSchema>({
    resolver: zodResolver(broadcastSystemMessageSchema),
    defaultValues: defaultBroadcastSystemMessageValues,
    mode: "onSubmit",
  });

  const title = useWatch({ control: form.control, name: "title" });
  const body = useWatch({ control: form.control, name: "body" });
  const titleLen = title?.length ?? 0;
  const bodyLen = body?.length ?? 0;

  return (
    <PageFrame>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<Megaphone className="size-3.5" aria-hidden />}>
            ადმინისტრაცია
          </PageEyebrow>
        }
        title="სისტემური შეტყობინება"
        description="გაუგზავნეთ ერთი შეტყობინება ყველა აქტიურ მომხმარებელს (დაბლოკილის გარდა). ის გამოჩნდება შეტყობინებების ზარის ქვეშ გამორჩეული სისტემური ეტიკეტით."
      />

      <ContentPanel className="mx-auto max-w-2xl">
        <div
          className={cn(
            "mb-6 flex items-start gap-3 rounded-xl border p-4",
            systemMessageCallout,
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              systemMessageIconBox,
            )}
          >
            <Megaphone className="size-5" aria-hidden />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">როგორ ხედავენ მომხმარებლები</p>
            <p className="mt-1">
              შეტყობინებას ექნება თეგი „სისტემური შეტყობინება“ და ყვითელი
              აქცენტი, რათა განსხვავდებოდეს ჩვეულებრივი შეტყობინებებისგან.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit((values) =>
              broadcast.mutate(values, {
                onSuccess: () => form.reset(defaultBroadcastSystemMessageValues),
              }),
            )}
          >
            <FieldGroup className="space-y-5">
              <Field data-invalid={!!form.formState.errors.title}>
                <FieldLabel htmlFor="system-message-title">სათაური</FieldLabel>
                <FieldContent>
                  <Input
                    id="system-message-title"
                    placeholder="მაგ. განახლება და ახალი ფუნქციები"
                    maxLength={200}
                    className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                    {...form.register("title")}
                  />
                  <FieldDescription className="text-right tabular-nums">
                    {titleLen}/200
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.title]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.body}>
                <FieldLabel htmlFor="system-message-body">ტექსტი</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="system-message-body"
                    placeholder="დეტალური აღწერა, რომელიც ყველას ნახავს..."
                    maxLength={4000}
                    rows={8}
                    className="min-h-[10rem] resize-y rounded-xl border-white/10 bg-surface-lowest"
                    {...form.register("body")}
                  />
                  <FieldDescription className="text-right tabular-nums">
                    {bodyLen}/4000
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.body]} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                გაგზავნისას მომხმარებლებს მიეღებათ in-app შეტყობინება (ზარი).
              </p>
              <Button
                type="submit"
                className="gap-2 rounded-xl"
                disabled={broadcast.isPending}
              >
                <Send className="size-4" aria-hidden />
                {broadcast.isPending ? "იგზავნება..." : "გაგზავნა ყველას"}
              </Button>
            </div>
          </form>
        </Form>
      </ContentPanel>
    </PageFrame>
  );
}
