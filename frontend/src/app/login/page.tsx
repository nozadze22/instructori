import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login/components/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
