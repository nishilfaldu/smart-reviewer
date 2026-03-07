import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

import { Providers } from "@/app/providers";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Reviewer",
  description:
    "Search recent news articles, generate AI-powered summaries with sentiment analysis, and browse structured results — all in one place.",
  openGraph: {
    title: "Smart Reviewer",
    description:
      "Search recent news articles, generate AI-powered summaries with sentiment analysis, and browse structured results.",
    type: "website",
    locale: "en_US",
    siteName: "Smart Reviewer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Reviewer",
    description:
      "AI-powered news article summaries and sentiment analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexSans.variable} ${sourceSerif.variable} antialiased`}
      >
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
