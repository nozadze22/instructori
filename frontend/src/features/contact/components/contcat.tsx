"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  fullName: z.string().min(2, "გთხოვთ მიუთითოთ სახელი და გვარი."),
  email: z.email("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა."),
  subject: z.string().min(3, "თემა უნდა იყოს მინიმუმ 3 სიმბოლო."),
  message: z.string().min(10, "შეტყობინება უნდა იყოს მინიმუმ 10 სიმბოლო."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const defaultValues: ContactFormValues = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

const faqs = [
  {
    title: "როგორ დავიწყო სწავლება?",
    description:
      "რეგისტრაციის შემდეგ ავტომატურად მიიღებთ წვდომას საბაზისო კურსებზე და სატესტო სიმულაციებზე.",
  },
  {
    title: "რა ღირს სიმულატორის პაკეტი?",
    description:
      "გვაქვს სხვადასხვა ტარიფი: ინდივიდუალური, პროფესიონალური და სასწავლო ცენტრის პაკეტები.",
  },
  {
    title: "ტექნიკური მხარდაჭერა",
    description:
      "ტექნიკურ საკითხებზე ჩვენი გუნდი ყოველდღე გპასუხობთ სწრაფად და პრაქტიკული ინსტრუქციით.",
  },
];

export function Contact() {
  const [isSent, setIsSent] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = (values: ContactFormValues) => {
    console.log("Contact form values", values);
    setIsSent(true);
    form.reset(defaultValues);
  };

  return (
    <>
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-container space-y-12">
          <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface-container-low px-8 py-14 text-center">
            <div className="absolute inset-0 bg-linear-to-b from-background/10 via-background/30 to-background/80" />
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                დაგვიკავშირდით
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                მზად ვართ გიპასუხოთ ნებისმიერ კითხვაზე SimDrive Pro-ს
                პლატფორმისა და სერვისების შესახებ.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="glass-card rounded-3xl border border-white/10 p-8 lg:col-span-7">
              <h2 className="mb-6 text-2xl font-bold text-primary">მოგვწერეთ</h2>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
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
                  disabled={form.formState.isSubmitting}
                >
                  გაგზავნა
                  <Send className="size-4" />
                </Button>
              </form>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="glass-card rounded-3xl border border-white/10 p-8">
                <h3 className="mb-6 text-xl font-bold">საკონტაქტო ინფორმაცია</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ელ-ფოსტა</p>
                      <p className="font-semibold">support@simdrive.pro</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ტელეფონი</p>
                      <p className="font-semibold">+995 322 00 00 00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">მისამართი</p>
                      <p className="font-semibold">
                        ილია ჭავჭავაძის გამზირი 37, თბილისი
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-4 text-xs tracking-widest text-muted-foreground uppercase">
                    სამუშაო საათები
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        ორშაბათი - პარასკევი
                      </span>
                      <span className="font-semibold">09:00 - 20:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        შაბათი - კვირა
                      </span>
                      <span className="font-semibold">10:00 - 18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-3xl border border-white/10 p-6">
                <div className="flex items-center gap-3">
                  <Clock3 className="size-5 text-primary" />
                  <p className="font-medium">სწრაფი მხარდაჭერა</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  საშუალო პასუხის დრო: 30-60 წუთი სამუშაო საათებში.
                </p>
              </div>

              <div className="glass-card rounded-3xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <p className="font-medium">მონაცემთა უსაფრთხოება</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  თქვენი ინფორმაცია დაცულია და გამოიყენება მხოლოდ კომუნიკაციისთვის.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">ხშირად დასმული კითხვები</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  იპოვეთ სწრაფი პასუხები პოპულარულ შეკითხვებზე.
                </p>
              </div>
              <Button variant="ghost" className="text-primary">
                ყველა კითხვის ნახვა
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {faqs.map((faq) => (
                <article
                  key={faq.title}
                  className="glass-card rounded-2xl border border-white/10 p-5 transition-colors hover:bg-surface-container-high"
                >
                  <h4 className="text-lg font-bold text-primary">{faq.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {faq.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {isSent ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-primary/20 p-8 text-center shadow-2xl shadow-primary/10">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
              <ShieldCheck className="size-8" />
            </div>
            <h3 className="text-2xl font-bold">მადლობა!</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              თქვენი შეტყობინება წარმატებით გაიგზავნა. ჩვენი გუნდი მალე
              დაგიკავშირდებათ.
            </p>
            <Button className="mt-6 w-full" onClick={() => setIsSent(false)}>
              დახურვა
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}