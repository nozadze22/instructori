import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HardHat } from "lucide-react";

export const metadata: Metadata = {
  title: "კონფიდენციალურობის პოლიტიკა | SimDrive Pro",
  description: "SimDrive Pro-ის კონფიდენციალურობის პოლიტიკა.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-card p-6 shadow-xl md:p-10">
        <Link
          href="/register"
          className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          რეგისტრაციაზე დაბრუნება
        </Link>

        <div className="mb-8 flex items-center gap-2">
          <HardHat className="size-8 fill-primary text-primary" />
          <span className="text-2xl font-bold text-primary">SimDrive Pro</span>
        </div>

        <h1 className="text-3xl font-bold md:text-4xl">კონფიდენციალურობის პოლიტიკა</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          ბოლო განახლება: 12 ოქტომბერი, 2026
        </p>

        <div className="mt-8 space-y-7 leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">1. რა ინფორმაციას ვაგროვებთ</h2>
            <p>
              ანგარიშის შექმნისას ვინახავთ თქვენს სახელს, ელ-ფოსტას და პაროლის
              დაცულ ჰეშს. პრაქტიკის გამოყენებისას შეიძლება დამუშავდეს სესიის,
              მარშრუტის, შეცდომებისა და მდებარეობის ინფორმაცია.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">2. როგორ ვიყენებთ ინფორმაციას</h2>
            <p>
              მონაცემებს ვიყენებთ ანგარიშის მუშაობისთვის, ავტორიზაციისთვის,
              ინსტრუქტორსა და მომხმარებელს შორის კავშირის შესაქმნელად და
              პრაქტიკის შედეგების სანახავად.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">3. მონაცემების გაზიარება</h2>
            <p>
              თქვენს მონაცემებს არ ვყიდით. მომხმარებლის პრაქტიკის ინფორმაცია
              ხელმისაწვდომია მისთვის და იმ ინსტრუქტორისთვის, რომელსაც მომხმარებელი
              საკუთარი თანხმობით დაუკავშირდა ინსტრუქტორის კოდით.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">4. უსაფრთხოება და შენახვა</h2>
            <p>
              ვიყენებთ ტექნიკურ ზომებს ანგარიშისა და მონაცემების დასაცავად.
              პაროლები ინახება დაშიფრული სახით და არა ჩვეულებრივი ტექსტით.
              მონაცემები ინახება მანამ, სანამ ანგარიში ან შესაბამისი ფუნქცია
              აქტიურია, ან სანამ კანონით სხვა ვადა არ არის საჭირო.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">5. თქვენი უფლებები</h2>
            <p>
              შეგიძლიათ მოითხოვოთ თქვენი მონაცემების ნახვა, გასწორება ან ანგარიშის
              წაშლა. მოთხოვნისთვის დაგვიკავშირდით აპლიკაციაში მითითებული
              საკონტაქტო არხით.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
