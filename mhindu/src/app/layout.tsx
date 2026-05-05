import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mhindu — cut the spray, grow the harvest",
  description:
    "Precision pest scouting for Sub-Saharan smallholder farmers. Photo → ID → biocontrol-first treatment plan. 90% less pesticide.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#b04a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bone-100 text-ink-900 min-h-dvh antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
