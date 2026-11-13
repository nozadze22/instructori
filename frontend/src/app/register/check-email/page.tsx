import { Suspense } from "react";

import { CheckEmailScreen } from "@/features/auth/verify-email/components/check-email-screen";

export default function RegisterCheckEmailPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <CheckEmailScreen />
    </Suspense>
  );
}
