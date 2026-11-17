import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login/components/login-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "შესვლა",
  path: "/login",
  description:
    "შესვლა Instructorebi (ინსტრუქტორები) ანგარიშზე — მართვის მოწმობის მომზადება, მარშრუტები და ჩატი.",
  keywords: ["instructorebi შესვლა", "ავტო ინსტრუქტორი პორტალი"],
});

export default function LoginPage() {
  return <LoginForm />;
}