"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Headphones,
  Map,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  APP_BRAND_NAME,
  APP_BRAND_NAME_LATIN,
} from "@/lib/site-config";

const STORY_LAB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAYURbuUjGSIgmFDM2KCmmN02Wx_F5HyrS0sXalTbB71TsBx6NxmMvQNodi1-Nwt1FSZ_nkiFqAH2HxfIO8pVlXZwBxVVGk6KOQs39WwOUs22AMf7gsq04fv1-aGS8KJjzOHaUuR-KVgcBK7AnrHbnr6oHOgoM87Nhv93uiVJ1Sa3JIWZLAh-aSIKpCzyf97yCFzJJvSjZ9RBUj2oFxBKvBFEjqjkT8c39t_rImLVa2vIysB0W9NoyhIFLjJ2sqPFdlqb-DHtmQ-iyP";

const STORY_COCKPIT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDku_DBX4_fDludVHYg6lVB_SuOlzgytIxib2fRBfHcRzrEOLqHN0Wocb2AsUQ7yL_-t2SJD7iQxxssKsJLWlDjTbgwv3y-nepVy5LhYjaSQvpV5yutpC85YihKXEath2H3qRCgWObmMg1S4Xje2SwF9Z_D_5XjpzCDD8b4Itu72EmKb3cU8BCvEEOxAikBs4SQLW7wf8UdLq5Ih36W8Cuf5UHyuvNTfK0oet65gdsr5VJH7xRi4X2EZ-19tfcdK79rEpsXP8m6L3Kr";

const TECH_DASH =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAI2tNjg8yepzLXvxcmk_NnrUClxRvna-oceSOByA-gQqJw_Ys_5HjhdjnvUVIcHvkignJ2Hn4hgcEHXxtLz_nzJsJkL5hMPpeybVw_0DDRpYEKSoKDd_NdugUdmIgvQa21oDE8wBNBdbkh8Ke7_IwSdCpo9L4rYtkNOkUIOOk92tUZq381GFw4rH2Rsrf9lqoU2-njQEOXieADLY9NXOar0lfRUvdvhlSZFJrtXKOXUW0TH7udpEWI-udYNk163YK1_kGWT_0xEsaS";

const stats = [
  { value: "8+", label: "საჯარო საგამოცდო მარშრუტი" },
  { value: "24/7", label: "ონლაინ წვდომა" },
  { value: "100%", label: "მობილურზე მორგებული" },
];

const techItems = [
  {
    icon: Map,
    title: "ინტერაქტიური რუკა",
    description:
      "საგამოცდო მარშრუტები Google Maps-ზე — ნავიგაცია, ნაბიჯები და რეალური გზის სიმულაცია სახლიდანაც კი.",
  },
  {
    icon: Headphones,
    title: "ხმოვანი ბრძანებები",
    description:
      "TTS ხმოვანი ინსტრუქციები მარშრუტის გასავლელზე — ისეთი გამოცდილება, როგორც ინსტრუქტორთან პრაქტიკაში.",
  },
  {
    icon: Users,
    title: "ინსტრუქტორების კატალოგი",
    description:
      "იპოვე სერტიფიცირებული ავტო ინსტრუქტორი, დაუკავშირდი და დაგეგმე პრაქტიკის გაკვეთილი ონლაინ.",
  },
];

const pillars = [
  {
    icon: Map,
    title: "მარშრუტების ბაზა",
    description: "საჯარო საგამოცდო მარშრუტები ქალაქების მიხედვით — სწავლა და გამეორება ნებისმიერ დროს.",
  },
  {
    icon: Headphones,
    title: "ხმა და ნავიგაცია",
    description: "ბრძანებები და ნაბიჯები ერთ გარემოში, რომ გზაზე დაბნეულობა არ დაგრჩეს.",
  },
  {
    icon: Users,
    title: "ინსტრუქტორები",
    description: "პლატფორმა აერთიანებს მძღოლებსა და ინსტრუქტორებს — რეგისტრაცია, ჩატი, პრაქტიკის მართვა.",
  },
  {
    icon: MessageCircle,
    title: "ურთიერთობა",
    description: "შეტყობინებები და პროგრესის თვალყურის დევნება ერთ აპში.",
  },
];

const cities = ["ბათუმი", "თბილისი", "ქუთაისი", "რუსთავი"];

export function About() {
  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <section className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 block text-xs font-bold tracking-[0.2em] text-primary uppercase">
            ჩვენი მისია
          </span>
          <h1 className="mb-8 text-4xl leading-tight font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-[48px] lg:leading-[56px]">
            დაეუფლეთ გზას{" "}
            <span className="text-primary">სიზუსტით.</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-7 text-muted-foreground">
            {APP_BRAND_NAME} ({APP_BRAND_NAME_LATIN}) — პლატფორმა მართვის მოწმობის
            მოსამზადებლად: საგამოცდო მარშრუტები, ხმოვანი ნავიგაცია და კავშირი
            ავტო ინსტრუქტორებთან საქართველოში.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="glass-card gap-2 rounded-2xl border-0 px-8 py-6 ring-0"
              >
                <CardContent className="flex flex-col items-center gap-2 p-0">
                  <span className="text-4xl font-extrabold text-primary md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="max-w-[12rem] text-center text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-low px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground md:text-[30px] md:leading-[38px]">
              ჩვენი ისტორია
            </h2>
            <div className="h-1 w-16 rounded-full bg-primary" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="group relative h-[400px] overflow-hidden rounded-3xl md:col-span-7">
              <Image
                src={STORY_LAB}
                alt="მართვის სწავლების პლატფორმა"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 pt-24">
                <h3 className="mb-2 text-xl font-bold text-white">
                  ინოვაცია მართვის სწავლაში
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-white/90">
                  გადმოვიტანეთ საჯარო საგამოცდო მარშრუტები და ნავიგაცია ონლაინ
                  გარემოში — რომ გამოცდამდე იცოდეთ გზა, არა მხოლოდ თეორია.
                </p>
              </div>
            </div>

            <Card className="glass-card flex flex-col justify-center gap-6 rounded-3xl border-0 p-8 ring-0 md:col-span-5">
              <p className="text-lg leading-relaxed text-foreground">
                {APP_BRAND_NAME_LATIN} დაიწყო მარტივი იდეით: მძღოლებს და
                ინსტრუქტორებს სჭირდებათ ერთი გაერთიანებული ადგილი — მარშრუტების
                სწავლა, პრაქტიკა და კომუნიკაცია.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                დღეს პლატფორმა მუშაობს ბრაუზერში და მობილურზე: საჯარო მარშრუტები,
                ხმოვანი ინსტრუქციები და ინსტრუქტორის კაბინეტი ერთ სისტემაში.
              </p>
            </Card>

            <Card className="glass-card flex flex-col gap-4 rounded-3xl border-0 p-8 ring-0 md:col-span-4">
              <Map className="size-12 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                რეალური მარშრუტები
              </h3>
              <p className="text-muted-foreground">
                მარშრუტები დაფუძნებულია რეალურ საგამოცდო ტრასებზე — ქალაქისა და
                სირთულის მიხედვით.
              </p>
            </Card>

            <div className="relative h-[300px] overflow-hidden rounded-3xl md:col-span-8">
              <Image
                src={STORY_COCKPIT}
                alt="მართვის სიმულაციის გარემო"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="w-full md:w-1/2">
              <h2 className="mb-6 text-3xl font-extrabold tracking-tighter text-foreground md:text-4xl">
                ტექნოლოგიური უპირატესობა
              </h2>
              <div className="space-y-8">
                {techItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-6">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-xl font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative w-full md:w-1/2">
              <div className="premium-gradient absolute -inset-4 rounded-full opacity-10 blur-3xl" />
              <div className="glass-card relative rounded-3xl p-4">
                <Image
                  src={TECH_DASH}
                  alt="მარშრუტის და პროგრესის პანელი"
                  width={800}
                  height={600}
                  className="w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-low px-6 py-20">
        <div className="mx-auto max-w-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-[30px] md:leading-[38px]">
              რას გთავაზობთ
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              ოთხი მთავარი მიმართულება, რაც გამოცდის მომზადებას უფრო მარტივს და
              ხელმისაწვდომს ხდის.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="glass-card gap-4 rounded-2xl border-0 p-6 ring-0"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-container">
          <p className="mb-8 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            მარშრუტები და ინსტრუქტორები საქართველოს ქალაქებში
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {cities.map((city) => (
              <span
                key={city}
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-6 py-20 pb-28 md:pb-20">
        <div className="glass-card relative mx-auto max-w-4xl overflow-hidden rounded-[40px] p-12 text-center">
          <div className="absolute -top-24 -right-24 size-64 bg-primary opacity-10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 size-64 bg-primary opacity-10 blur-[100px]" />
          <h2 className="relative mb-6 text-3xl font-extrabold tracking-tighter text-foreground md:text-4xl">
            მზად ხართ დაიწყოთ?
          </h2>
          <p className="relative mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            გაეცანით საჯარო მარშრუტებს ან დარეგისტრირდით როგორც მძღოლი ან
            ინსტრუქტორი.
          </p>
          <div className="relative flex flex-wrap justify-center gap-4">
            <Button
              render={<Link href="/marshrutebi" />}
              className="glow-hover h-12 rounded-2xl bg-primary px-10 text-lg font-bold text-on-primary-container hover:bg-primary/90"
            >
              მარშრუტები
            </Button>
            <Button
              render={<Link href="/register" />}
              variant="outline"
              className="h-12 rounded-2xl px-10 text-lg font-semibold"
            >
              რეგისტრაცია
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-container flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="font-bold text-foreground">{APP_BRAND_NAME}</span>
            <span>© {new Date().getFullYear()} ყველა უფლება დაცულია</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              კონფიდენციალურობა
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              წესები და პირობები
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              კონტაქტი
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}