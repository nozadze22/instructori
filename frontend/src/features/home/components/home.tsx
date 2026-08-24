"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Cloud,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { appHomeForUser } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";

const TRAILER_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoFI-_HToor0LPw_IvLc8NvbmrI8POGTrARkwRC_fp174Ae8Qv9ChKP0GWBol9ErxmEydGOsbAHDBUWsWrajkkw0yyvSPadHMX003JZW61t1U0Lo88ssaS3dgq9ry-oApA2QvkrlHpVAyK9WI2SPg-NiWo0KQkmD-FdB0TyKyUDTg74ZpqdOJpZ9EKMU5v2onNR7pz0aFW1T_uR2hzbC74ZkJHP_iKMmhxi6OE3qxFCyvJpXeGxNDKHVJlfMTXNgefDZhf4tSFdsB";

const TELEMETRY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB4tsrH68uHgwF6DniKcylT5X-U48njXdFXcFdvBgp44RCc59YuS6exuz9B1D_q5heAyJQshVSjwqYItsm6EVDUpJCv1iqgC3cKDMUp4wYkAnJyu80kkNZk7d2anW2U5AT3sK_8dgoLDwHpk3V-y9LXlxfk9MOIRQFx1bsa2P6D0uHI6SQM8JbXj18oESK9BUR7X4vAo8DrwsxJEUp556cmjqCgcez2hx8YfcjyIu-MJB35f3EPmov3YWNzAP9jg4XnYjGiYtz1VlOg";

const stats = [
  { value: "15K+", label: "აქტიური სტუდენტი" },
  { value: "98%", label: "წარმატების მაჩვენებელი" },
  { value: "250+", label: "სიმულირებული მარშრუტი" },
  { value: "12", label: "გლობალური ცენტრი" },
];

const plans = [
  {
    tier: "სრული პაკეტი",
    name: "რუკის სერვისი",
    price: "100 ₾",
    featured: true,
    features: [
      "ულიმიტო მარშრუტები",
      "ინტერაქტიული რუკა და ნავიგაცია",
      "მარშრუტის რედაქტორი და სიმულაცია",
      "რეალურ დროში ტელემეტრია",
      "რუკაში შემავალი ყველა ფუნქცია",
    ],
    cta: "დაიწყე",
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-[0_0_24px_rgb(173_198_255_/_15%)]">
      {children}
    </div>
  );
}

export function Home() {
  const router = useRouter();
  const { data: me, isSuccess } = useGetMe();
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    if (isSuccess && me) {
      router.replace(appHomeForUser(me));
    }
  }, [isSuccess, me, router]);

  return (
    <>
      <section
        id="overview"
        className="hero-gradient relative flex min-h-[921px] items-center justify-center overflow-hidden px-4 py-16"
      >
        <div className="relative z-10 mx-auto grid max-w-container grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 text-center lg:text-left">
            <Badge
              variant="outline"
              className="h-auto gap-2 rounded-full border-primary/20 bg-primary/10 px-4 py-1 text-primary tracking-widest uppercase"
            >
              <BadgeCheck className="size-4!" />
              კორპორატიული დონის სისტემა
            </Badge>

            <h1 className="text-glow text-4xl leading-tight font-extrabold tracking-tighter md:text-5xl lg:text-[48px] lg:leading-[56px]">
              დაეუფლე გზას{" "}
              <span className="text-primary">სიზუსტით.</span>
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-7 text-muted-foreground lg:mx-0">
              გამოსცადე ყველაზე მოწინავე მართვის სიმულაციის პლატფორმა,
              შექმნილი მაღალი სტანდარტის გამოცდებისთვის. პროფესიონალური
              ფიზიკა ხვდება ინტუიციურ სწავლას.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                className="h-12 rounded-xl px-12 text-sm shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:bg-primary-container"
              >
                დაიწყე
              </Button>
              <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                <DialogTrigger
                  render={
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass h-12 rounded-xl border-white/10 px-12 text-sm text-foreground hover:bg-white/5"
                    />
                  }
                >
                  <PlayCircle data-icon="inline-start" />
                  ტრეილერის ნახვა
                </DialogTrigger>
                <DialogContent
                  overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
                  className="w-[calc(100%-2rem)] gap-0 overflow-hidden border-0 bg-surface p-0 ring-1 ring-white/10 sm:max-w-3xl"
                >
                  <DialogHeader className="gap-1 px-5 pt-5 pr-12 pb-3">
                    <DialogTitle className="text-lg">
                      როგორ მუშაობს სერვისი
                    </DialogTitle>
                    <DialogDescription>
                      რუკის სერვისის მოკლე დემო: მარშრუტები, ნავიგაცია და რუკაში
                      შემავალი ყველა ფუნქცია.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="aspect-video bg-black">
                    {trailerOpen ? (
                      <video
                        src={TRAILER_SRC}
                        className="size-full object-cover"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : null}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl transition-all duration-500 group-hover:bg-primary/30" />
            <div className="glass relative aspect-video overflow-hidden rounded-[2rem] p-1 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-1">
              <Image
                src={HERO_IMAGE}
                alt="მაღალი დონის 3D მართვის სიმულატორი"
                width={960}
                height={540}
                priority
                className="h-full w-full rounded-[1.8rem] object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-surface/90 via-surface/20 to-transparent p-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    აქტიური სესია
                  </span>
                  <span className="text-xl font-semibold">
                    ღამის ქალაქის ნავიგაცია
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* სტატისტიკა ჯერ ტყუილია */}
      {false && (
      <section className="border-y border-white/5 bg-surface-low/30 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-container px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 text-center">
                <h3 className="text-3xl font-extrabold text-primary md:text-[30px] md:leading-[38px]">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      <section id="history" className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-container space-y-12">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-[30px] md:leading-[38px]">
              სიზუსტე უკეთესი სწავლისთვის
            </h2>
            <p className="text-base text-muted-foreground">
              ჩვენი პლატფორმა აერთიანებს საჰაერო კოსმოსური დონის ტელემეტრიას
              ინტუიციურ სასწავლო ინსტრუმენტებთან, რათა დააჩქაროს შენი მართვის
              დაუფლება.
            </p>
          </div>

          <div className="grid h-auto grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            <Card className="glass group relative gap-0 overflow-hidden border-0 bg-gradient-to-br from-white/[0.06] to-transparent py-6 shadow-[0_20px_60px_rgb(0_0_0_/_35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 md:col-span-2">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(173_198_255_/_12%),transparent_45%)]" />
              <CardHeader className="relative space-y-4">
                <FeatureIcon>
                  <BarChart3 className="size-6" />
                </FeatureIcon>
                <CardTitle className="text-xl font-semibold">
                  მოწინავე ტელემეტრია
                </CardTitle>
                <CardDescription className="max-w-lg text-base leading-relaxed text-muted-foreground">
                  თვალყური ადევნე ყოველ პედლის მოძრაობასა და საჭის შეყვანას
                  რეალურ დროში მილიწამის სიზუსტით. ჩვენი AI აანალიზებს შენს
                  სტილს და გაწვდის პერსონალურ უკუკავშირს.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative mt-6">
                <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 shadow-inner">
                  <Image
                    src={TELEMETRY_IMAGE}
                    alt="მართვის მეტრიკების ანალიტიკური დაფა"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass group relative gap-4 overflow-hidden border-0 bg-gradient-to-b from-white/[0.06] to-transparent py-6 shadow-[0_20px_60px_rgb(0_0_0_/_35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(173_198_255_/_10%),transparent_60%)]" />
              <CardHeader className="relative space-y-4">
                <FeatureIcon>
                  <Cloud className="size-6" />
                </FeatureIcon>
                <CardTitle className="text-xl font-semibold">
                  ღრუბლოვანი სინქრონიზაცია
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  შენი პროგრესი გაყვება ნებისმიერ სიმულატორ ცენტრსა თუ სახლის
                  დაყენებას მყისიერად.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="support"
        className="relative overflow-hidden bg-surface-lowest px-4 py-16"
      >
        <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-container">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-[30px] md:leading-[38px]">
              რუკის მომსახურება
            </h2>
            <p className="text-base text-muted-foreground">
              ერთი გეგმა რუკის სერვისისთვის და მასში შემავალი ყველა ფუნქციისთვის.
            </p>
          </div>

          <div className="mx-auto grid max-w-md grid-cols-1 items-stretch">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "glass group relative h-full gap-0 overflow-hidden border-0 bg-gradient-to-b from-white/[0.07] to-transparent py-0 shadow-[0_24px_70px_rgb(0_0_0_/_40%)] ring-1 transition-all duration-300 hover:-translate-y-1",
                  plan.featured
                    ? "ring-primary/40 shadow-primary/10"
                    : "ring-white/10 hover:ring-primary/30",
                )}
              >
                {plan.featured ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(173_198_255_/_18%),transparent_55%)]" />
                    <Badge className="absolute -top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 tracking-tight shadow-lg shadow-primary/30">
                      რეკომენდებული
                    </Badge>
                  </>
                ) : (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(255_255_255_/_6%),transparent_50%)]" />
                )}

                <CardHeader className="relative space-y-1 px-8 pt-8">
                  <span
                    className={cn(
                      "text-sm font-medium tracking-wide",
                      plan.featured ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {plan.tier}
                  </span>
                  <CardTitle className="text-xl font-semibold">
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative flex flex-1 flex-col gap-6 px-8 pt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      / თვე
                    </span>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative mt-auto border-t border-white/10 bg-transparent px-8 py-6">
                  <Button
                    className={cn(
                      "h-11 w-full shrink-0 rounded-xl text-sm transition-all",
                      plan.featured
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-container hover:shadow-primary/40"
                        : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10",
                    )}
                    variant={plan.featured ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-container">
          <Card className="glass group relative gap-0 overflow-hidden rounded-[2rem] border-0 bg-gradient-to-br from-primary/10 via-white/[0.04] to-transparent py-12 shadow-[0_30px_80px_rgb(0_0_0_/_45%)] ring-1 ring-white/10 md:py-16">
            <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <CardContent className="relative z-10 space-y-6 px-12 text-center md:px-16">
              <h2 className="text-4xl leading-tight font-extrabold tracking-tighter md:text-5xl">
                მზად ხარ საჭესთან დასაჯდომად?
              </h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                შეუერთდი ათასობით სტუდენტს, რომლებმაც გზა დაეუფლნენ SimDrive
                Pro-ს ელიტური ტრენინგის ეკოსისტემით.
              </p>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="h-12 rounded-xl px-16 text-xl font-semibold shadow-2xl shadow-primary/30 transition-all hover:scale-105"
                >
                  საცდელი პერიოდის დაწყება
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
