import { Hero } from "@/components/home/Hero";
import { PhotoToFigure } from "@/components/home/PhotoToFigure";
import { HowItWorks } from "@/components/home/HowItWorks";
import { KitReveal } from "@/components/home/KitReveal";
import { Gallery } from "@/components/home/Gallery";
import { FinalCta } from "@/components/home/FinalCta";
import { Marquee } from "@/components/home/Marquee";

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <PhotoToFigure />
      <HowItWorks />
      <KitReveal />
      <Gallery />
      <FinalCta />
    </main>
  );
}
