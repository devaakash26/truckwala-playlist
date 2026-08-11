import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Rozha_One, Space_Mono } from "next/font/google";

import { DEFAULT_PHASE_ID, STATION } from "@/lib/constants";
import { PHASE_BOOT_SCRIPT } from "@/lib/phase";

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
  title: `${STATION.NAME} ${STATION.SUFFIX} — ${STATION.TAGLINE}`,
  description:
    "Ek highway station. Purane truck-driver ke gaane, chalta hua raasta, aur bas agla-pichla button.",
  applicationName: `${STATION.NAME} ${STATION.SUFFIX}`,
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
