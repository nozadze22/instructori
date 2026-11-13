import { Suspense } from "react";

import { VerifyEmailHandler } from "@/features/auth/verify-email/components/verify-email-handler";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <VerifyEmailHandler />
    </Suspense>
  );
}
