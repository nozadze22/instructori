import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Sans_Georgian } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppSerwistProvider } from "@/components/providers/serwist-provider";
import { AppChrome } from "@/components/shared/app-chrome";
import { PRODUCTION_APP_URL } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_APP_URL),
  title: "SimDrive Pro | პროფესიული სიმულაციური ტრენინგი",
  description:
    "ყველაზე მოწინავე მართვის სიმულაციის პლატფორმა მაღალი სტანდარტის გამოცდებისთვის.",
  applicationName: "SimDrive Pro",
  appleWebApp: {
    capable: true,
    title: "SimDrive Pro",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
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

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${inter.variable} ${notoSansGeorgian.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <AppSerwistProvider>
          <Providers>
            <AppChrome>{children}</AppChrome>
          </Providers>
        </AppSerwistProvider>
      </body>
    </html>
  );
}
