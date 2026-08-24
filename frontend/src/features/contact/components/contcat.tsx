"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ContactForm } from "@/features/contact/components/contact-form";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoFI-_HToor0LPw_IvLc8NvbmrI8POGTrARkwRC_fp174Ae8Qv9ChKP0GWBol9ErxmEydGOsbAHDBUWsWrajkkw0yyvSPadHMX003JZW61t1U0Lo88ssaS3dgq9ry-oApA2QvkrlHpVAyK9WI2SPg-NiWo0KQkmD-FdB0TyKyUDTg74ZpqdOJpZ9EKMU5v2onNR7pz0aFW1T_uR2hzbC74ZkJHP_iKMmhxi6OE3qxFCyvJpXeGxNDKHVJlfMTXNgefDZhf4tSFdsB";

const contactChannels = [
  {
    icon: Mail,
    label: "ელ-ფოსტა",
    value: "support@simdrive.pro",
    href: "mailto:support@simdrive.pro",
  },
  {
    icon: Phone,
    label: "ტელეფონი",
    value: "+995 322 00 00 00",
    href: "tel:+995322000000",
  },
  {
    icon: MapPin,
    label: "მისამართი",
    value: "ილია ჭავჭავაძის გამზირი 37, თბილისი",
    href: "https://maps.google.com/?q=Ilia+Chavchavadze+Avenue+37+Tbilisi",
  },
] as const;

const supportHighlights = [
  {
    icon: Clock3,
    title: "სწრაფი მხარდაჭერა",
    description: "საშუალო პასუხის დრო: 30–60 წუთი სამუშაო საათებში.",
  },
  {
    icon: ShieldCheck,
    title: "მონაცემთა უსაფრთხოება",
    description:
      "თქვენი ინფორმაცია დაცულია და გამოიყენება მხოლოდ კომუნიკაციისთვის.",
  },
  {
    icon: Headphones,
    title: "პირადი კონსულტაცია",
    description: "ინსტრუქტორები და ტექნიკური გუნდი მზად არიან დაგეხმარონ.",
  },
] as const;

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
    <div className="overflow-x-hidden bg-surface-lowest text-foreground">
      <section className="relative flex min-h-[70vh] items-end overflow-hidden px-6 pb-16 pt-28 md:min-h-[75vh] md:pb-20">
        <Image
          src={HERO_IMAGE}
          alt="SimDrive Pro სიმულატორის გარემო"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-surface-lowest/40 via-surface-lowest/70 to-surface-lowest" />
        <div className="absolute inset-0 bg-linear-to-r from-surface-lowest/80 via-surface-lowest/40 to-transparent" />
        <div className="hero-gradient absolute inset-0 opacity-80" />

        <div className="relative z-10 mx-auto w-full max-w-container">
          <p className="mb-4 text-xs font-bold tracking-[0.25em] text-primary uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
            SimDrive Pro
          </p>
          <h1 className="text-glow max-w-3xl text-4xl leading-tight font-extrabold tracking-tighter text-white md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            დაგვიკავშირდით
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">
            მზად ვართ გიპასუხოთ ნებისმიერ კითხვაზე SimDrive Pro-ს პლატფორმისა და
            სერვისების შესახებ.
          </p>
        </div>
      </section>

      <main className="relative px-6 pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-primary/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-container space-y-16 md:space-y-24">
          <section className="grid grid-cols-1 gap-8">
            <div className="glass group relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border-0 p-6 shadow-[0_30px_80px_rgb(0_0_0_/_45%)] ring-1 ring-white/10 md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  შეტყობინება
                </p>
                <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
                  მოგვწერეთ
                </h2>
                <p className="mb-8 max-w-none text-sm text-muted-foreground">
                  შეავსეთ ფორმა და ჩვენი გუნდი დაგიკავშირდებათ სამუშაო საათებში.
                </p>
                <ContactForm />
              </div>
            </div>

              {/* საკონტაქტო ინფორმაცია ჯერ არ სჭირდება */}
              {false && (
              <div className="glass relative overflow-hidden rounded-[2rem] p-7 shadow-[0_24px_70px_rgb(0_0_0_/_40%)] ring-1 ring-white/10 md:p-8">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative">
                  <h3 className="mb-6 text-xl font-bold tracking-tight">
                    საკონტაქტო ინფორმაცია
                  </h3>
                  <div className="space-y-5">
                    {contactChannels.map(({ icon: Icon, label, value, href }) => (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="group/item flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5 text-primary shadow-[0_0_24px_rgb(173_198_255_/_12%)] transition-transform duration-300 group-hover/item:scale-105">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 pt-1">
                          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {label}
                          </p>
                          <p className="mt-1 font-semibold text-foreground break-words">
                            {value}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      სამუშაო საათები
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-lowest/60 px-4 py-3">
                        <span className="text-muted-foreground">
                          ორშაბათი – პარასკევი
                        </span>
                        <span className="font-semibold text-primary">
                          09:00 – 20:00
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-lowest/60 px-4 py-3">
                        <span className="text-muted-foreground">
                          შაბათი – კვირა
                        </span>
                        <span className="font-semibold text-primary">
                          10:00 – 18:00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {supportHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className={cn(
                    "glass group relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30",
                    title === "მონაცემთა უსაფრთხოება" &&
                      "bg-linear-to-br from-primary/10 via-transparent to-transparent",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold tracking-tight">{title}</p>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  FAQ
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  ხშირად დასმული კითხვები
                </h3>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
                  იპოვეთ სწრაფი პასუხები პოპულარულ შეკითხვებზე.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                ყველა კითხვის ნახვა
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {faqs.map((faq, index) => (
                <article
                  key={faq.title}
                  className="glass group relative overflow-hidden rounded-[1.5rem] p-6 shadow-[0_20px_60px_rgb(0_0_0_/_35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="pointer-events-none absolute -bottom-10 -right-10 size-32 rounded-full bg-primary/5 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="mb-4 inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {faq.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {faq.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
