import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { AnalyticsScripts } from "@/components/analytics-scripts";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Onofri & Difulvio | Centro Odontológico",
  description:
    "Centro odontológico moderno con enfoque humano, especialidades integrales y solicitud de turno online.",
  openGraph: {
    title: "Onofri & Difulvio",
    description:
      "Odontología moderna, cercana y precisa. Solicita tu turno online y conoce al equipo.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} font-sans bg-white text-ink antialiased`}>
        <AnalyticsScripts />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
