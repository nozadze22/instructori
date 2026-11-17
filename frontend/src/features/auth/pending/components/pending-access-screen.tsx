"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  LogOut,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@/features/auth/login/hooks/login";
import { cn } from "@/lib/utils";

function PendingLoading() {
  return (
    <main className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-5%] size-[35%] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>
      <div className="glass-card relative z-10 w-full max-w-md animate-pulse rounded-[20px] p-8 shadow-2xl">
        <div className="mx-auto mb-6 size-14 rounded-2xl bg-muted" />
        <div className="mx-auto h-7 w-48 rounded-lg bg-muted" />
        <div className="mx-auto mt-4 h-4 w-full max-w-sm rounded bg-muted" />
        <div className="mx-auto mt-2 h-4 w-4/5 rounded bg-muted" />
      </div>
    </main>
  );
}

type PendingStep = {
  done: boolean;
  label: string;
  detail: string;
  active?: boolean;
};

function PendingHeader({ userName }: { userName: string }) {
  const first = userName.trim().split(/\s+/)[0] ?? userName;

  return (
  <>
    <span className="mx-auto mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
      </span>
      მოლოდინში
    </span>

    <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
      <Clock3 className="size-7" aria-hidden />
    </div>

    <h1 className="text-2xl font-bold tracking-tight text-foreground">
      მოგესალმები, {first}
    </h1>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
      ანგარიში წარმატებით შეიქმნა. ადმინისტრატორი გადახედავს პროფილს და
      გაგიხსნის წვდომას ჩარიცხვის ან უფასო რეჟიმის შემდეგ.
    </p>
  </>
  );
}

function StepRow({
  step,
  showConnector,
}: {
  step: PendingStep;
  showConnector: boolean;
}) {
  return (
    <li
      className={cn(
        "relative flex gap-4 pb-6 last:pb-0",
        showConnector &&
          "before:absolute before:top-9 before:left-[15px] before:h-[calc(100%-1.25rem)] before:w-px before:bg-border",
      )}
    >
      <span
        className={cn(
          "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border",
          step.done &&
            "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          step.active &&
            "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400",
          !step.done &&
            !step.active &&
            "border-border bg-muted/50 text-muted-foreground",
        )}
      >
        {step.done ? (
          <CheckCircle2 className="size-4" aria-hidden />
        ) : step.active ? (
          <Clock3 className="size-4 animate-pulse" aria-hidden />
        ) : (
          <Circle className="size-3 fill-current" aria-hidden />
        )}
      </span>
      <div
        className={cn(
          "min-w-0 flex-1 pt-0.5",
          step.active && "rounded-lg bg-amber-500/5 px-3 py-2 -mx-3 -my-0.5",
        )}
      >
        <p
          className={cn(
            "text-sm font-semibold",
            (step.done || step.active) && "text-foreground",
            !step.done && !step.active && "text-muted-foreground",
          )}
        >
          {step.label}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {step.detail}
        </p>
      </div>
    </li>
  );
}

export function PendingAccessScreen() {
  const router = useRouter();
  const { data: me, isLoading, isError } = useGetMe();
  const { mutate: logout, isPending } = useLogout();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me) {
      router.replace("/login");
      return;
    }
    if (me.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (me.accessStatus === "ACTIVE") {
      router.replace("/marshrutebi");
    }
  }, [isError, isLoading, me, router]);

  if (
    isLoading ||
    !me ||
    me.role !== "INSTRUCTOR" ||
    me.accessStatus === "ACTIVE"
  ) {
    return <PendingLoading />;
  }

  const steps: PendingStep[] = [
    {
      done: true,
      label: "ანგარიში შეიქმნა",
      detail: me.email,
    },
    {
      done: false,
      active: true,
      label: "ადმინისტრატორის დადასტურება",
      detail: "ჩვეულებრივ რამდენიმე საათის განმავლობაში",
    },
    {
      done: false,
      label: "სრული წვდომა პლატფორმაზე",
      detail: "მარშრუტები, ჩატი და სხვა ფუნქციები",
    },
  ];

  return (
    <main className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-5%] size-[35%] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[20px] p-8 text-center shadow-2xl">
          <PendingHeader userName={me.fullName} />

          <ol className="mt-8 space-y-0 text-left">
            {steps.map((step, index) => (
              <StepRow
                key={step.label}
                step={step}
                showConnector={index < steps.length - 1}
              />
            ))}
          </ol>

          <p className="mt-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            როცა წვდომა გაიხსნება, შეტყობინებას მიიღებ ელფოსტაზე ან შეგიძლია
            პერიოდულად შემოსვლა — გვერდი ავტომატურად გადაიყვანს შენს სამუშაო
            სივრცეში.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl font-medium"
              disabled={isPending}
              onClick={() => logout()}
            >
              <LogOut className="size-4" aria-hidden />
              {isPending ? "იტვირთება..." : "გამოსვლა"}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            კითხვა გაქვს?{" "}
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              დაგვიკავშირდი
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}