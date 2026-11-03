import type { Metadata } from "next";
import { FaqPage } from "@/components/faq/FaqPage";

export const metadata: Metadata = {
  title: "FAQ — MiniMe Studio",
  description: "Domande frequenti su statuette MiniMe, foto, kit di pittura e regali.",
};

export default function Page() {
  return <FaqPage />;
}
