import type { Metadata } from "next";
import { Configurator } from "@/components/crea/Configurator";

export const metadata: Metadata = {
  title: "Crea la tua MiniMe — MiniMe Studio",
  description: "Configuratore 3D dimostrativo: scegli capelli, vestiti, colori, accessori e posa della tua statuetta.",
};

export default function Page() {
  return <Configurator />;
}
