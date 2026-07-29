"use client";

import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/features/contact/components/contact-form";

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
              <ContactForm />
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

    </>
  );
}