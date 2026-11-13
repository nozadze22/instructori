"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTurnstileSubmit } from "@/hooks/use-turnstile-submit";
import { useResendEmailVerification } from "../hooks/verify-email";

export function CheckEmailScreen() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const { mutate: resend, isPending } = useResendEmailVerification();
  const {
    TurnstileField,
    turnstileProps,
    turnstileToken,
    submitBlocked,
    ensureTurnstileToken,
    resetTurnstile,
  } = useTurnstileSubmit();

  const handleResend = () => {
    if (!email) return;
    if (!ensureTurnstileToken()) return;
    resend(
      { email, turnstileToken: turnstileToken ?? undefined },
      { onError: resetTurnstile },
    );
  };

  return (
    <main className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-5%] size-[35%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[20px] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Mail className="size-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            შეამოწმე ელფოსტა
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            რეგისტრაცია თითქმის მზადაა. გამოგიგზავნეთ დადასტურების ბმული
            {email ? (
              <>
                {" "}
                მისამართზე{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </>
            ) : (
              " შენს ელფოსტაზე"
            )}
            . ბმულზე დაჭერამდე ანგარიში არ იქმნება.
          </p>

          {email ? (
            <div className="mt-8 space-y-3 text-left">
              <p className="text-center text-xs text-muted-foreground">
                არ მოვიდა? ხელახლა გაგზავნა საჭიროებს დადასტურებას ქვემოთ.
              </p>
              <TurnstileField {...turnstileProps} className="p-3" />
              <Button
                type="button"
                className="h-11 w-full rounded-xl bg-blue-700 font-semibold border-none text-white transition-all duration-300 ease-in-out  outline-none shadow-red-600/30 hover:bg-red-600/90 hover:text-white"
                disabled={isPending || submitBlocked}
                onClick={handleResend}
              >
                {isPending ? "იგზავნება..." : "წერილის ხელახლა გაგზავნა"}
              </Button>
            </div>
          ) : null}

          <p className="mt-8 text-sm text-muted-foreground">
            უკვე დაადასტურე?{" "} 
            <Link href="/login" className="font-semibold text-primary hover:underline">
              შესვლა
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
