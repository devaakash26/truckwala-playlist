import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Rozha_One, Space_Mono } from "next/font/google";

import { DEFAULT_PHASE_ID, SITE } from "@/lib/constants";
import { PHASE_BOOT_SCRIPT } from "@/lib/phase";
import { playlistJsonLd, SEO, STATION_NAME } from "@/lib/seo";

import "./globals.css";

const display = Rozha_One({
  weight: "400",
  // Devanagari carries the blessing painted across the truck's tailgate.
  subsets: ["latin", "devanagari"],
  variable: "--font-display",
  display: "swap",
});

const tech = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tech",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.URL),
  title: {
    default: SEO.TITLE,
    template: `%s · ${STATION_NAME}`,
  },
  description: SEO.DESCRIPTION,
  keywords: [...SEO.KEYWORDS],
  applicationName: STATION_NAME,
  category: "music",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.URL,
    siteName: STATION_NAME,
    title: SEO.TITLE,
    description: SEO.DESCRIPTION,
    locale: SITE.LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.TITLE,
    description: SEO.DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-phase={DEFAULT_PHASE_ID} suppressHydrationWarning>
      <body className={`${display.variable} ${tech.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: PHASE_BOOT_SCRIPT }} />
        {/* The visible page is a player with two lines of text on it, so this
            is what actually tells a crawler what the site is: the station and
            the 47 tracks it plays. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistJsonLd()) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
