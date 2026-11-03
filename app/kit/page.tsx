import type { Metadata } from "next";
import { KitPage } from "@/components/kit/KitPage";

export const metadata: Metadata = {
  title: "Il Kit — MiniMe Studio",
  description: "MiniMe Color Kit: statuetta 3D cartoon da 15 cm, colori acrilici, pennelli e guida. Prezzo indicativo 29,90 €.",
};

export default function Page() {
  return <KitPage />;
}
