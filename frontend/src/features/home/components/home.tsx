"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { NavigationDemoPlayer } from "@/features/home/components/navigation-demo-player";
import { PrecisionFeatures } from "@/features/home/components/precision-features";
import { appHomeForUser } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/hero-city-exam-nav.jpg";

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
    price: "70 ₾",
    featured: true,
    available: true,
    features: [
      "ულიმიტო მარშრუტები",
      "ინტერაქტიული რუკა და ნავიგაცია",
      "მარშრუტის რედაქტორი და სიმულაცია",
      "რუკაში შემავალი ყველა ფუნქცია",
    ],
    cta: "დაიწყე",
  },
  {
    tier: "სტანდარტი",
    name: "რუკა + ანალიტიკა",
    price: "100 ₾",
    featured: false,
    available: false,
    features: [
      "ულიმიტო მარშრუტები",
      "ინტერაქტიული რუკა და ნავიგაცია",
      "მარშრუტის რედაქტორი და სიმულაცია",
      "რუკაში შემავალი ყველა ფუნქცია",
      "შეცდომების ჩანაწერები (Note)",
      "დიაგრამები და სტატისტიკა",
    ],
    cta: "მალე",
  },
  {
    tier: "პრემიუმ",
    name: "პროფილი და კატალოგი",
    price: "150 ₾",
    featured: false,
    available: false,
    features: [
      "ულიმიტო მარშრუტები",
      "ინტერაქტიული რუკა და ნავიგაცია",
      "მარშრუტის რედაქტორი და სიმულაცია",
      "რუკაში შემავალი ყველა ფუნქცია",
      "შეცდომების ჩანაწერები (Note)",
      "დიაგრამები და სტატისტიკა",
      "შეფასებები მომხმარებლებისგან",
      "გამოჩენა კატალოგში",
      "3 საკუთარი რუკა პროფილზე",
    ],
    cta: "მალე",
  },
];

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
                onClick={() => router.push("/register")}
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
                  ნავიგაციის დემო
                </DialogTrigger>
                <DialogContent
                  overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
                  className="w-[calc(100%-1rem)] gap-0 overflow-hidden border-0 bg-surface p-0 ring-1 ring-white/10 sm:max-w-4xl"
                >
                  <DialogHeader className="gap-1 px-5 pt-5 pr-12 pb-3 sm:px-6">
                    <DialogTitle className="text-lg sm:text-xl">
                      როგორ მუშაობს ნავიგაცია
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      ცოცხალი დემო ჩვენი რუკით: მანქანა მოძრაობს ლურჯ ხაზზე და
                      ხმა იძახის ბრძანებებს — როგორც მანქანაში.
                    </DialogDescription>
                  </DialogHeader>
                  <NavigationDemoPlayer
                    key={trailerOpen ? "demo-on" : "demo-off"}
                    active={trailerOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl transition-all duration-500 group-hover:bg-primary/30" />
            <div className="glass relative aspect-video overflow-hidden rounded-[2rem] p-1 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-1">
              <Image
                src={HERO_IMAGE}
                alt="ქალაქის გამოცდის ნავიგაცია რუკაზე"
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
                    ქალაქის გამოცდის ნავიგაცია
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

      <PrecisionFeatures />

      <section
        id="support"
        className="relative overflow-hidden bg-surface-lowest px-4 py-16"
      >
        <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-primary/5 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-container">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-[30px] md:leading-[38px]">
              რუკის მომსახურება
            </h2>
            <p className="mx-auto max-w-lg text-base text-muted-foreground">
              აირჩიე პაკეტი — რუკიდან ანალიტიკამდე და პროფილის ხილვადობამდე.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-5 pt-2 md:grid-cols-3 md:gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.tier}
                className={cn(
                  "glass group relative flex h-full flex-col gap-0 overflow-hidden rounded-[1.75rem] border-0 py-0 shadow-[0_24px_70px_rgb(0_0_0_/_40%)] ring-1 transition-all duration-300",
                  plan.available && "hover:-translate-y-1.5",
                  plan.featured
                    ? "bg-gradient-to-b from-primary/[0.14] via-white/[0.05] to-transparent ring-primary/50 shadow-[0_0_50px_rgb(173_198_255_/_18%)]"
                    : "bg-gradient-to-b from-white/[0.06] via-transparent to-transparent ring-white/10",
                  !plan.available && "opacity-[0.72]",
                )}
              >
                {plan.featured ? (
                  <>
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(173_198_255_/_28%),transparent)]" />
                  </>
                ) : (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(255_255_255_/_5%),transparent_55%)]" />
                )}

                <CardHeader className="relative space-y-4 px-7 pt-7 pb-1">
                  <div className="flex min-h-7 items-center justify-between gap-2">
                    {plan.featured ? (
                      <Badge className="rounded-full bg-primary px-3.5 py-1 text-xs font-semibold tracking-wide text-primary-foreground shadow-md shadow-primary/35">
                        რეკომენდებული
                      </Badge>
                    ) : (
                      <span className="text-sm font-medium tracking-wide text-muted-foreground">
                        {plan.tier}
                      </span>
                    )}
                    {!plan.available ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        მალე
                      </Badge>
                    ) : null}
                  </div>

                  {plan.featured ? (
                    <span className="text-sm font-medium tracking-wide text-primary">
                      {plan.tier}
                    </span>
                  ) : null}

                  <CardTitle className="text-[1.35rem] leading-tight font-semibold tracking-tight">
                    {plan.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative flex flex-1 flex-col gap-6 px-7 pt-3 pb-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[2.15rem] leading-none font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        / თვე
                      </span>
                    </div>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full",
                            plan.featured
                              ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                              : "bg-white/10 text-primary/80 ring-1 ring-white/10",
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                        </span>
                        <span
                          className={cn(
                            plan.featured && "text-foreground/85",
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative mt-auto border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent px-7 py-5">
                  <Button
                    disabled={!plan.available}
                    className={cn(
                      "h-11 w-full shrink-0 rounded-xl text-sm font-semibold transition-all duration-300",
                      plan.available && plan.featured
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/35 hover:scale-[1.02] hover:bg-primary-container hover:shadow-primary/50"
                        : plan.available
                          ? "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                          : "pointer-events-none cursor-not-allowed border border-white/10 bg-white/[0.03] text-muted-foreground opacity-55",
                    )}
                    variant={
                      plan.available && plan.featured ? "default" : "outline"
                    }
                    onClick={() => {
                      if (!plan.available) return;
                      router.push("/register");
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            მზად ხარ ახალი გამოწვევებისთვის?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            შეუერთდი ინსტრუქტორებს და დაიწყე მომზადება ქალაქის გამოცდისთვის.
          </p>
          <Button
            size="lg"
            className="mt-6 h-11 rounded-xl px-8 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary-container"
            onClick={() => router.push("/register")}
          >
            დაიწყე დღესვე
          </Button>
        </div>
      </section>
    </>
  );
}
