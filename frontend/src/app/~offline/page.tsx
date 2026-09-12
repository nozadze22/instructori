import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ინტერნეტი არ არის",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        ინტერნეტი არ არის ხელმისაწვდომი
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        SimDrive Pro-ს სრული ფუნქციებისთვის საჭიროა ინტერნეტ-კავშირი. გთხოვთ,
        შეამოწმოთ ქსელი და სცადოთ ხელახლა.
      </p>
      <Button render={<Link href="/" />}>მთავარ გვერდზე დაბრუნება</Button>
    </main>
  );
}
