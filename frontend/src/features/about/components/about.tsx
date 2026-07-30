"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  Eye,
  Factory,
  Link2,
  Satellite,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STORY_LAB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAYURbuUjGSIgmFDM2KCmmN02Wx_F5HyrS0sXalTbB71TsBx6NxmMvQNodi1-Nwt1FSZ_nkiFqAH2HxfIO8pVlXZwBxVVGk6KOQs39WwOUs22AMf7gsq04fv1-aGS8KJjzOHaUuR-KVgcBK7AnrHbnr6oHOgoM87Nhv93uiVJ1Sa3JIWZLAh-aSIKpCzyf97yCFzJJvSjZ9RBUj2oFxBKvBFEjqjkT8c39t_rImLVa2vIysB0W9NoyhIFLjJ2sqPFdlqb-DHtmQ-iyP";

const STORY_COCKPIT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDku_DBX4_fDludVHYg6lVB_SuOlzgytIxib2fRBfHcRzrEOLqHN0Wocb2AsUQ7yL_-t2SJD7iQxxssKsJLWlDjTbgwv3y-nepVy5LhYjaSQvpV5yutpC85YihKXEath2H3qRCgWObmMg1S4Xje2SwF9Z_D_5XjpzCDD8b4Itu72EmKb3cU8BCvEEOxAikBs4SQLW7wf8UdLq5Ih36W8Cuf5UHyuvNTfK0oet65gdsr5VJH7xRi4X2EZ-19tfcdK79rEpsXP8m6L3Kr";

const TECH_DASH =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAI2tNjg8yepzLXvxcmk_NnrUClxRvna-oceSOByA-gQqJw_Ys_5HjhdjnvUVIcHvkignJ2Hn4hgcEHXxtLz_nzJsJkL5hMPpeybVw_0DDRpYEKSoKDd_NdugUdmIgvQa21oDE8wBNBdbkh8Ke7_IwSdCpo9L4rYtkNOkUIOOk92tUZq381GFw4rH2Rsrf9lqoU2-njQEOXieADLY9NXOar0lfRUvdvhlSZFJrtXKOXUW0TH7udpEWI-udYNk163YK1_kGWT_0xEsaS";

const stats = [
  { value: "99%", label: "რეალისტურობა" },
  { value: "15k+", label: "კურსდამთავრებული" },
  { value: "0%", label: "რისკი" },
];

const techItems = [
  {
    icon: Brain,
    title: "AI-ზე დაფუძნებული ანალიტიკა",
    description:
      "ჩვენი ხელოვნური ინტელექტი აანალიზებს თქვენს ყოველ მოძრაობას და გაწვდით პერსონალიზებულ რჩევებს რეალურ დროში.",
  },
  {
    icon: Satellite,
    title: "აეროკოსმოსური ტელემეტრია",
    description:
      "მონაცემთა გადაცემის სიზუსტე, რომელიც გამოიყენება ავიაციაში, ახლა ხელმისაწვდომია თქვენი პროგრესის დასათვლელად.",
  },
  {
    icon: Eye,
    title: "Ultra-HD რენდერინგი",
    description:
      "ვიზუალიზაცია, რომელიც შეუმჩნეველია რეალური ხედისგან, გთავაზობთ სრულ კონცენტრაციას გზაზე.",
  },
];

const team = [
  {
    name: "დავით ბერიძე",
    role: "მთავარი ინჟინერი",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgOTBzf8KhB9KgTU0uWnH81Z13DFMB74hB5HAxtYxqs2fhQtjenHotvPIHFMjsFaIJwSoOg_FGzCOzfyIsh_KfqUQAxQrlgbToqohOIr759pyZ6rTpZtEoxz1TKekw578e0Wn0VCntPD9ztE4mOZ0PCulFSR9Lx0hITvzTjl-QWsD2A2i4Kmg4jKbyL-YE9FFWPNq8DSND_cYSsUbXNZF7mFyQAVPsbkC6F6OPZxp87cdMNpyGO7_MNKpbpEidhw0lBer4Fyc70gns",
  },
  {
    name: "ანა კაპანაძე",
    role: "AI არქიტექტორი",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ohy6AxF_0o8txg_vMhFbEnObllsAV_YIVyo_vUSx_6mKB1Zm67cg-g8_MHJcpu2h04VCYf627hsQ69KJLfHYRiDY9dREyPeHcy2EpcVyILeWIATXIhZlPUU90eijZsBB7DylkD09Q9_4S6vc8TOiyTipKcNLCVAwa4SBnSqISivsbqXwm2UIdSj-vGTIp-46vg8xE8YCDUYCeD5oN8O4aeqbGIPgWYdPWIzI4a7fRAzCSGjtO9G05oYmrH8hTlgabxfRJUZ5kxyF",
  },
  {
    name: "გიორგი მახარაძე",
    role: "უფროსი ინსტრუქტორი",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClXptLyU0CG4rXRaRT6BaMjFRqa1XqnXRSSiS5yKLCXnz409C5yZCA6LH4QMuiJukUbp3DpEEmrPwh92dXXv_UISwdKy9J4RACNlqfh60tOeylcoUIrPGWpAw6PMqRw3T_9LvY3Ns67JfTIsr00J565uimVXRz_h5pLmWDekjRPwOZIgOtOsOA0zZ2HVWXyzEYWAl2BCwer0aKgN3VWK9zT0bj3-47JVfbbAGs7kboEuq645rrJhg72qIyDeC7dtWTjTcrryE85_va",
  },
  {
    name: "ლევან ცინცაძე",
    role: "ტელემეტრიის ექსპერტი",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD451amTmS8ZdwQbJCQH_0b9iTPM_DiYn77OhmOXgP2cLTvfdt7M6pyAunYYlEcX8rRpflLZsTl5lH5Mv7LZuuzDYUf-xJqQEZpuhZxyLL-GwO2SMgvXhIz4dUqvW1Ozh2rnF84qN55hFhjNPI6HVYaDN5ONqsOzvfIEB3tRiBJQ4nrsSFG3xaUjEAt-K4dH93Bd0b3se0yJkEtVAb71jbbMan-t-MA2zCLMirho4Pw7jrHrRrc4n-DKJbtCNMbrrkoXBHEZBL8Kcx6",
  },
];

const partners = [
  "TECHCORE",
  "AERO SYSTEMS",
  "DATA NEXUS",
  "VELOCITY",
  "ZENITH LABS",
];

export function About() {
  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <div className="relative min-h-screen">
        <section className="relative overflow-hidden px-6 pt-24 pb-20">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <span className="mb-4 block text-xs font-bold tracking-[0.2em] text-primary uppercase">
              ჩვენი მისია
            </span>
            <h1 className="mb-8 text-4xl leading-tight font-extrabold tracking-tighter text-white md:text-5xl lg:text-[48px] lg:leading-[56px]">
              დაეუფლეთ გზას <span className="text-primary">სიზუსტით.</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-7 text-muted-foreground">
              ჩვენი მიზანია შევქმნათ მართვის სწავლების ისეთი გამოცდილება, რომელიც
              სცილდება ტრადიციულ საზღვრებს. SimDrive Pro-სთან ერთად, თქვენ
              სწავლობთ არა მხოლოდ მართვას, არამედ გზის სრულ კონტროლს.
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
                    <span className="text-sm font-medium text-muted-foreground">
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
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-[30px] md:leading-[38px]">
                ჩვენი ისტორია
              </h2>
              <div className="h-1 w-16 rounded-full bg-primary" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="group relative h-[400px] overflow-hidden rounded-3xl md:col-span-7">
                <Image
                  src={STORY_LAB}
                  alt="სიმულატორების ლაბორატორია"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 p-6">
                  <h3 className="mb-1 text-xl font-bold">ინოვაციის საწყისები</h3>
                  <p className="max-w-md text-muted-foreground">
                    როგორ ვაქციეთ აეროკოსმოსური ტექნოლოგიები მართვის სწავლების
                    საუკეთესო ინსტრუმენტად.
                  </p>
                </div>
              </div>

              <Card className="glass-card flex flex-col justify-center gap-6 rounded-3xl border-0 p-8 ring-0 md:col-span-5">
                <p className="text-lg leading-relaxed text-foreground">
                  SimDrive Pro დაიბადა ერთი იდეით: მართვის სწავლება უნდა იყოს
                  ისეთივე დახვეწილი, როგორც თანამედროვე ავტომობილები. ჩვენმა
                  გუნდმა, რომელიც შედგება ყოფილი სარბოლო ინჟინრებისა და AI
                  სპეციალისტებისგან, შექმნა მსოფლიოში ყველაზე განვითარებული
                  სიმულატორი.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  წლების განმავლობაში ჩვენ ვხვეწდით ყოველ დეტალს — საჭის
                  უკუკავშირიდან დაწყებული, რეალური სამყაროს ფიზიკის სრული
                  იმიტაციით დამთავრებული.
                </p>
              </Card>

              <Card className="glass-card flex flex-col gap-4 rounded-3xl border-0 p-8 ring-0 md:col-span-4">
                <Factory className="size-12 text-primary" />
                <h3 className="text-xl font-bold">გერმანული ინჟინერია</h3>
                <p className="text-muted-foreground">
                  ჩვენი მექანიკური პლატფორმები იყენებენ უმაღლესი სიზუსტის
                  კომპონენტებს სრული იმერსიისთვის.
                </p>
              </Card>

              <div className="relative h-[300px] overflow-hidden rounded-3xl md:col-span-8">
                <Image
                  src={STORY_COCKPIT}
                  alt="პროფესიონალური სიმულატორის კაბინა"
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
                <h2 className="mb-6 text-4xl font-extrabold tracking-tighter text-white md:text-5xl">
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
                          <h3 className="mb-1 text-xl font-bold">{item.title}</h3>
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
                    alt="ტელემეტრიის დაფა"
                    width={800}
                    height={600}
                    className="w-full rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-lowest px-6 py-20">
          <div className="mx-auto max-w-container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-white md:text-[30px] md:leading-[38px]">
                გაიცანით ექსპერტები
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                ჩვენი გუნდი აერთიანებს საუკეთესო ინჟინრებსა და ინსტრუქტორებს ერთი
                მიზნის გარშემო.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="group">
                  <div className="relative mb-4 h-80 overflow-hidden rounded-2xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full bg-white/10 hover:bg-primary hover:text-primary-foreground"
                        aria-label={`${member.name} პროფილი`}
                      >
                        <Link2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-container">
            <p className="mb-8 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              ჩვენი პარტნიორები
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all duration-500 hover:grayscale-0">
              {partners.map((partner) => (
                <span
                  key={partner}
                  className="text-xl font-bold tracking-tighter text-foreground"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-surface px-6 py-20 pb-28 md:pb-20">
          <div className="glass-card relative mx-auto max-w-4xl overflow-hidden rounded-[40px] p-12 text-center">
            <div className="absolute -top-24 -right-24 size-64 bg-primary opacity-10 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 size-64 bg-primary opacity-10 blur-[100px]" />
            <h2 className="relative mb-6 text-4xl font-extrabold tracking-tighter text-white md:text-5xl">
              მზად ხართ დაიწყოთ?
            </h2>
            <p className="relative mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              შემოუერთდით SimDrive Pro-ს და გახდით პროფესიონალი მძღოლი ყველაზე
              უსაფრთხო და მოწინავე გარემოში.
            </p>
            <Button className="glow-hover relative h-14 rounded-2xl bg-primary px-16 text-xl font-bold text-on-primary-container hover:bg-primary/90 active:scale-[0.98]">
              დაჯავშნეთ სესია
            </Button>
          </div>

          <div className="mx-auto mt-12 flex max-w-container flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-4">
              <span className="font-bold text-white">SimDrive Pro</span>
              <span>© 2024 ყველა უფლება დაცულია</span>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="transition-colors hover:text-primary">
                კონფიდენციალურობა
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                წესები და პირობები
              </Link>
              <Link href="#" className="transition-colors hover:text-primary">
                კონტაქტი
              </Link>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
