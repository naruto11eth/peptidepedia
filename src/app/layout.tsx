import type { Metadata } from "next";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL("https://peptidepedia.example"),
  title: {
    default: "Peptidepedia - an evidence-tiered reference for peptides",
    template: "%s · Peptidepedia",
  },
  description:
    "A plain-language reference for peptides and related compounds: what the human evidence actually shows, how they are dosed, what goes wrong, and where the regulatory lines sit.",
  openGraph: {
    type: "website",
    siteName: "Peptidepedia",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
