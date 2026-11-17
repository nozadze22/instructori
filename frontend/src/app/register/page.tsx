import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/register/components/register_form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "რეგისტრაცია",
  path: "/register",
  description:
    "დარეგისტრირდი Instructorebi-ზე ავტო ინსტრუქტორად ან სტუდენტად — მართვის მოწმობის სწავლა, პრაქტიკა და საგამოცდო მარშრუტები ერთ პლატფორმაზე.",
  keywords: [
    "ინსტრუქტორის რეგისტრაცია",
    "ავტოსკოლის რეგისტრაცია",
    "instructorebi რეგისტრაცია",
  ],
});

export default function RegisterPage() {
  return <RegisterForm />;
}