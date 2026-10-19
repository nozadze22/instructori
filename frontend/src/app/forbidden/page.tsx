"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

import { useGetMe } from "@/features/auth/login/hooks/login";
import { Button, buttonVariants } from "@/components/ui/button";
import { appHomeForUser, isAppUser } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";

function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { data: me } = useGetMe();

  const homeHref = me ? appHomeForUser(me) : "/";

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-destructive/5 via-transparent to-surface-lowest" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center px-4 text-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="size-7" />
        </div>

        <p className="text-6xl font-extrabold tracking-tighter text-destructive md:text-7xl">
          403
        </p>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          წვდომა აკრძალულია
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
          ამ გვერდზე შესვლის უფლება არ გაქვს. თუ ეს შეცდომაა, დაუკავშირდი
          ადმინისტრატორს.
          {from ? (
            <span className="mt-2 block text-xs text-muted-foreground/80">
              მოთხოვნილი გვერდი: {from}
            </span>
          ) : null}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="glass h-11 rounded-xl border-white/10 px-5 font-semibold"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
            უკან
          </Button>
          <Link
            href={homeHref}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 rounded-xl px-5 font-semibold shadow-lg",
            )}
          >
            <Home className="size-4" />
            {me && isAppUser(me) ? "პროფილი" : "მთავარი"}
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-11 rounded-xl px-5 font-semibold",
            )}
          >
            კონტაქტი
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <ForbiddenContent />
    </Suspense>
  );
}
