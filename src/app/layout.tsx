import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "L'Atelier de l'Impression — Impression et personnalisation à Aulnay-sous-Bois",
    template: "%s | L'Atelier de l'Impression",
  },
  description:
    "Personnalisez vos textiles et objets avec votre logo. Simulateur en ligne, devis rapide. Aulnay-sous-Bois (93600), Seine-Saint-Denis.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "L'Atelier de l'Impression" },
};
export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
