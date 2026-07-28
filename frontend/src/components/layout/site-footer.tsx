import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const platformLinks = [
  { label: "სიმულატორები", href: "#" },
  { label: "კურსები", href: "#" },
  { label: "ანალიტიკა", href: "#" },
  { label: "ლიდერბორდი", href: "#" },
];

const companyLinks = [
  { label: "ჩვენს შესახებ", href: "/about" },
  { label: "კარიერა", href: "#" },
  { label: "ბლოგი", href: "#" },
  { label: "უსაფრთხოება", href: "#" },
];


const legalLinks = [
  { label: "კონფიდენციალურობა", href: "#" },
  { label: "მომსახურების პირობები", href: "#" },
  { label: "ქუქი-ფაილები", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-surface-lowest pt-16 pb-8">
      <div className="mx-auto max-w-container px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <span className="text-xl font-semibold tracking-tight text-primary">
              SimDrive Pro
            </span>
            <p className="text-base text-muted-foreground">
              ინდუსტრიის სტანდარტი მაღალი წარმადობის მართვის სიმულაციასა და
              პროფესიულ განათლებაში.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium tracking-wide text-foreground">
              პლატფორმა
            </h4>
            <ul className="space-y-2 text-base text-muted-foreground">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium tracking-wide text-foreground">
              კომპანია
            </h4>
            <ul className="space-y-2 text-base text-muted-foreground">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium tracking-wide text-foreground">
              სიახლეები
            </h4>
            <p className="text-base text-muted-foreground">
              მიიღე განახლებები ახალ მარშრუტებსა და ფუნქციებზე.
            </p>
            <div className="flex gap-1">
              <Input
                type="email"
                placeholder="ელფოსტა"
                className="h-9 flex-1 bg-surface"
              />
              <Button className="h-9 px-4">გაწევრიანება</Button>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
          <p className="text-xs font-semibold text-muted-foreground">
            © 2024 SimDrive Pro. ყველა უფლება დაცულია.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-muted-foreground md:gap-8">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
