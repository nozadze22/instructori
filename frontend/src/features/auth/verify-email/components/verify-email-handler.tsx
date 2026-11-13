"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "../hooks/verify-email";

export function VerifyEmailHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const started = useRef(false);
  const { mutate: verify, isPending, isError, isSuccess } = useVerifyEmail();

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify(token);
  }, [token, verify]);

  if (!token) {
    return (
      <StatusCard
        icon={<XCircle className="size-7 text-destructive" />}
        title="ბმული არასწორია"
        description="დადასტურების ბმული ცარიელია ან არასწორი ფორმატისაა."
        action={
          <Button
            render={<Link href="/register" />}
            nativeButton={false}
            className="h-11 w-full rounded-xl"
          >
            რეგისტრაციაზე დაბრუნება
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return (
      <StatusCard
        icon={<Loader2 className="size-7 animate-spin text-primary" />}
        title="ელფოსტა მოწმდება..."
        description="ერთი წამი — ანგარიში იქმნება დადასტურების შემდეგ."
      />
    );
  }

  if (isSuccess) {
    return (
      <StatusCard
        icon={<ShieldCheck className="size-7 text-primary" />}
        title="დადასტურებულია"
        description="გადამისამართება..."
      />
    );
  }

  if (isError) {
    return (
      <StatusCard
        icon={<XCircle className="size-7 text-destructive" />}
        title="ბმული ვადაგასულია ან არასწორია"
        description="სცადე ახალი რეგისტრაცია ან მოითხოვე ახალი დადასტურების წერილი."
        action={
          <div className="flex w-full flex-col gap-2">
            <Button
              render={<Link href="/register" />}
              nativeButton={false}
              className="h-11 w-full rounded-xl"
            >
              ახალი რეგისტრაცია
            </Button>
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="outline"
              className="h-11 w-full rounded-xl border-white/10"
            >
              შესვლა
            </Button>
          </div>
        }
      />
    );
  }

  return null;
}

function StatusCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <main className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[20px] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-surface-low">
            {icon}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {action ? <div className="mt-8">{action}</div> : null}
        </div>
      </div>
    </main>
  );
}
