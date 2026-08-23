import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppChrome } from "@/components/shared/app-chrome";
import "./globals.css";

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-sans",
  subsets: ["georgian", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimDrive Pro | პროფესიული სიმულაციური ტრენინგი",
  description:
    "ყველაზე მოწინავე მართვის სიმულაციის პლატფორმა მაღალი სტანდარტის გამოცდებისთვის.",
  applicationName: "Instructori",
  appleWebApp: {
    title: "Instructori",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${notoSansGeorgian.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
