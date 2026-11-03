import type { Metadata } from "next";
import { StoryPage } from "@/components/story/StoryPage";

export const metadata: Metadata = {
  title: "Come funziona — MiniMe Studio",
  description: "Dalla foto alla statuetta: disegno cartoon, stampa 3D in resina, rifinitura, pittura e confezione regalo.",
};

export default function Page() {
  return <StoryPage />;
}
