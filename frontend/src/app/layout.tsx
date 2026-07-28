import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import { Providers } from "@/components/providers";
import Navbar from "@/components/shared/navbar/navaber";
import Wrapper from "@/components/shared/wrapper/wrapper";
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
          <Navbar />
          <main className="mt-16 flex-1">
            <Wrapper>{children}</Wrapper>
          </main>
        </Providers>
      </body>
    </html>
  );
}
