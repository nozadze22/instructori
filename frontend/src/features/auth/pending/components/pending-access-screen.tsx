"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@/features/auth/login/hooks/login";

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
    if (me.role === "ADMIN" || me.accessStatus === "ACTIVE") {
      router.replace(me.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [isError, isLoading, me, router]);

  if (isLoading || !me || me.accessStatus === "ACTIVE") {
    return (
      <p className="text-sm text-muted-foreground">იტვირთება...</p>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        წვდომა მოლოდინშია
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        ანგარიში შექმნილია. ადმინისტრატორი გაგიხსნის წვდომას ჩარიცხვის შემდეგ
        ან უფასოდ.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          მთავარი
        </Link>
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() => logout()}
        >
          გამოსვლა
        </Button>
      </div>
    </div>
  );
}
