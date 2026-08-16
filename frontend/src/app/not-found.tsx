import Link from "next/link";
import { ArrowLeft, HardHat, Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-gradient absolute inset-0 opacity-90" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-surface-lowest" />
        <div className="absolute top-1/4 left-1/2 size-112 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center px-4 text-center animate-in fade-in slide-in-from-bottom-3 duration-700">
        <div className="mb-8 flex items-center gap-2">
          <HardHat className="size-8 fill-primary text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">
            SimDrive Pro
          </span>
        </div>

        <p className="text-glow text-7xl font-extrabold tracking-tighter text-primary md:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          გვერდი ვერ მოიძებნა
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
          ეს მარშრუტი არ არსებობს ან გადატანილია. დაბრუნდი მთავარ გვერდზე და
          განაგრძე სწავლა SimDrive Pro-ზე.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 rounded-xl px-5 font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]",
            )}
          >
            <Home className="size-4" />
            მთავარი
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "glass h-11 rounded-xl border-white/10 px-5 font-semibold hover:bg-white/5",
            )}
          >
            <ArrowLeft className="size-4" />
            კონტაქტი
          </Link>
        </div>
      </div>
    </div>
  );
}
