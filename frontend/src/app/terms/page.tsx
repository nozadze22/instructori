import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HardHat } from "lucide-react";

export const metadata: Metadata = {
  title: "წესები და პირობები | SimDrive Pro",
  description: "SimDrive Pro-ის გამოყენების წესები და პირობები.",
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold md:text-4xl">წესები და პირობები</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          ბოლო განახლება: 12 ოქტომბერი, 2026
        </p>

        <div className="mt-8 space-y-7 leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">1. სერვისის შესახებ</h2>
            <p>
              SimDrive Pro არის მართვის სწავლებისა და პრაქტიკის დამხმარე პლატფორმა.
              პლატფორმაზე განთავსებული მასალა და პრაქტიკის ჩანაწერები ემსახურება
              სწავლის პროცესის გაუმჯობესებას და არ ცვლის რეალურ ინსტრუქტაჟს ან
              საგზაო მოძრაობის წესებს.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">2. ანგარიშის გამოყენება</h2>
            <p>
              რეგისტრაციისას უნდა მიუთითოთ ზუსტი ინფორმაცია და შეინარჩუნოთ
              პაროლის კონფიდენციალურობა. თქვენი ანგარიშით შესრულებულ მოქმედებებზე
              პასუხისმგებლობა გეკისრებათ თქვენ.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">3. ინსტრუქტორი და მომხმარებელი</h2>
            <p>
              მომხმარებელს შეუძლია ანგარიში ინსტრუქტორის კოდით დაუკავშიროს
              შესაბამის ინსტრუქტორს. კოდის გაზიარება უნდა მოხდეს მხოლოდ მისი
              მფლობელის თანხმობით. ყალბი ან სხვისი მონაცემების გამოყენება
              დაუშვებელია.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">4. უსაფრთხოება და პასუხისმგებლობა</h2>
            <p>
              რეალურ გზაზე გადაადგილებისას ყოველთვის დაიცავით მოქმედი კანონები,
              საგზაო ნიშნები და ინსტრუქტორის მითითებები. SimDrive Pro არ არის
              პასუხისმგებელი პლატფორმის მიღმა მიღებულ გადაწყვეტილებებზე.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">5. წესების ცვლილება</h2>
            <p>
              საჭიროების შემთხვევაში პირობები შეიძლება განახლდეს. ცვლილებები
              გამოქვეყნდება ამ გვერდზე განახლების თარიღის მითითებით.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
