import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Sans_Georgian } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppSerwistProvider } from "@/components/providers/serwist-provider";
import { AppChrome } from "@/components/shared/app-chrome";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import {
  APP_BRAND_NAME,
  APP_BRAND_NAME_LATIN,
  APP_DEFAULT_TITLE,
  APP_TITLE_TEMPLATE,
  PRODUCTION_APP_URL,
} from "@/lib/site-config";
import {
  DEFAULT_SITE_DESCRIPTION_TEXT,
  ROOT_METADATA_KEYWORDS,
} from "@/lib/seo";
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
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: DEFAULT_SITE_DESCRIPTION_TEXT,
  keywords: ROOT_METADATA_KEYWORDS,
  authors: [{ name: APP_BRAND_NAME_LATIN, url: PRODUCTION_APP_URL }],
  creator: APP_BRAND_NAME_LATIN,
  publisher: APP_BRAND_NAME,
  category: "education",
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: PRODUCTION_APP_URL,
    siteName: APP_BRAND_NAME,
    title: APP_DEFAULT_TITLE,
    description: DEFAULT_SITE_DESCRIPTION_TEXT,
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: APP_BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: DEFAULT_SITE_DESCRIPTION_TEXT,
    images: ["/web-app-manifest-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: PRODUCTION_APP_URL,
    languages: { "ka-GE": PRODUCTION_APP_URL },
  },
  applicationName: APP_BRAND_NAME_LATIN,
  appleWebApp: {
    capable: true,
    title: APP_BRAND_NAME,
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
        <SiteJsonLd />
        <AppSerwistProvider>
          <Providers>
            <AppChrome>{children}</AppChrome>
          </Providers>
        </AppSerwistProvider>
      </body>
    </html>
  );
}
