import Image from "next/image";
import Link from "next/link";
import { Headphones, Map, MessageCircle, Route, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  APP_BRAND_NAME,
  APP_BRAND_NAME_LATIN,
} from "@/lib/site-config";

const HERO_MAP = "/hero-city-exam-nav.jpg";

const stats = [
  { value: "8+", label: "საჯარო საგამოცდო მარშრუტი" },
  { value: "24/7", label: "ონლაინ წვდომა" },
  { value: "100%", label: "მობილურზე მორგებული" },
] as const;

const features = [
  {
    icon: Map,
    title: "ინტერაქტიური რუკა",
    description:
      "საგამოცდო მარშრუტები რუკაზე — ნავიგაცია, ნაბიჯები და გამოცდისთვის მომზადება სახლიდანაც კი.",
  },
  {
    icon: Headphones,
    title: "ხმოვანი ბრძანებები",
    description:
      "ხმოვანი ინსტრუქციები მარშრუტზე — ისეთივე გამოცდილება, როგორც პრაქტიკაში ინსტრუქტორთან.",
  },
  {
    icon: Users,
    title: "ინსტრუქტორების კატალოგი",
    description:
      "იპოვე ავტო ინსტრუქტორი, დაუკავშირდი და დაგეგმე პრაქტიკის გაკვეთილი.",
  },
  {
    icon: MessageCircle,
    title: "ჩატი და პროგრესი",
    description:
      "შეტყობინებები, პრაქტიკის ჩანაწერები და პროგრესი ერთ პლატფორმაზე.",
  },
] as const;

const cities = ["ბათუმი", "თბილისი", "ქუთაისი", "რუსთავი"] as const;

/** საჯარო «ჩვენს შესახებ» — მუქი ტექსტი ღია ფონზე, Instructorebi ბრენდი. */
export function About() {
  return (
    <div className="bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-sky-50 to-white px-6 pt-24 pb-16 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
            {APP_BRAND_NAME_LATIN}
          </p>
          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            დაეუფლეთ გზას{" "}
            <span className="text-sky-600 dark:text-sky-400">სიზუსტით</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">
              {APP_BRAND_NAME}
            </span>{" "}
            ({APP_BRAND_NAME_LATIN}) — პლატფორმა მართვის მოწმობის მოსამზადებლად:
            საგამოცდო მარშრუტები, ხმოვანი ნავიგაცია და კავშირი ავტო
            ინსტრუქტორებთან საქართველოში.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="min-w-[9rem] border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <CardContent className="flex flex-col items-center gap-1 px-6 py-5">
                  <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="max-w-[11rem] text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-container items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={HERO_MAP}
              alt={`${APP_BRAND_NAME_LATIN} — საგამოცდო მარშრუტები`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
              ჩვენი მიზანი
            </h2>
            <div className="mb-6 h-1 w-14 rounded-full bg-sky-600 dark:bg-sky-500" />
            <p className="mb-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {APP_BRAND_NAME_LATIN} შეიქმნა იმისთვის, რომ მძღოლებსა და
              ინსტრუქტორებს ჰქონდეთ ერთი ადგილი — მარშრუტის სწავლა, პრაქტიკა და
              კომუნიკაცია ყოველდღიურად.
            </p>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
              პლატფორმა მუშაობს ბრაუზერში და ტელეფონზე: საჯარო მარშრუტები,
              ხმოვანი ინსტრუქციები, ინსტრუქტორის პროფილი და ჩატი ერთ სისტემაში.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                render={<Link href="/marshrutebi" />}
                className="rounded-xl bg-sky-600 text-white hover:bg-sky-700"
              >
                <Route className="size-4" data-icon="inline-start" />
                მარშრუტები
              </Button>
              <Button
                render={<Link href="/instructors" />}
                variant="outline"
                className="rounded-xl border-slate-300 text-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                ინსტრუქტორები
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-slate-50 px-6 py-16 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-container">
          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
            რას გთავაზობთ
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-slate-600 dark:text-slate-400">
            ყველაფერი, რაც გამოცდამდე მომზადებას უფრო მარტივს ხდის.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                >
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="px-6 py-14">
        <p className="mb-6 text-center text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
          მარშრუტები და ინსტრუქტორები
        </p>
        <div className="mx-auto flex max-w-container flex-wrap justify-center gap-6">
          {cities.map((city) => (
            <span
              key={city}
              className="text-lg font-semibold text-slate-800 dark:text-slate-200"
            >
              {city}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-sky-600 px-6 py-16 text-white dark:border-slate-800">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight">
            მზად ხართ დაიწყოთ?
          </h2>
          <p className="mb-8 text-lg text-sky-100">
            შემოუერთდით {APP_BRAND_NAME_LATIN}-ს — გაეცანით საჯარო მარშრუტებს ან
            დარეგისტრირდით როგორც მძღოლი ან ინსტრუქტორი.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              render={<Link href="/register" />}
              className="h-12 rounded-xl bg-white px-8 text-base font-semibold text-sky-700 hover:bg-sky-50"
            >
              რეგისტრაცია
            </Button>
            <Button
              render={<Link href="/contact" />}
              variant="outline"
              className="h-12 rounded-xl border-white/40 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
            >
              კონტაქტი
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}