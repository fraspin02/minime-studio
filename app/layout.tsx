import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export const metadata: Metadata = {
  title: "MiniMe Studio — Le persone che ami, in versione mini",
  description:
    "Statuette 3D cartoon personalizzate da una foto, alte circa 15 cm, con kit di pittura incluso. Creala, ricevila, colorala.",
};

export const viewport: Viewport = {
  themeColor: "#FAF8F4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <a href="#contenuto" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
          Vai al contenuto
        </a>
        <SmoothScroll />
        <Header />
        <div id="contenuto">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
