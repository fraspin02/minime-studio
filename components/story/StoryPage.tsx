"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Camera, PenTool, Printer, Sparkles, Palette, Gift } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Button, Eyebrow, FadeIn, RevealText } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";

const StoryScene = dynamic(() => import("./StoryScene"), { ssr: false });

const CHAPTERS = [
  { icon: Camera, k: "La foto", title: "Tutto parte da un ricordo.", text: "Scegli una foto in cui si vedono bene viso, capelli e vestiti. Puoi inviarne più di una: più dettagli, più somiglianza." },
  { icon: PenTool, k: "Il disegno", title: "La reinterpretiamo in chiave cartoon.", text: "Testa un po' più grande, occhi essenziali, proporzioni morbide. Teniamo ciò che rende unica quella persona: la pettinatura, lo stile, la posa." },
  { icon: Printer, k: "La stampa 3D", title: "Prende forma, strato dopo strato.", text: "Il modello viene stampato in resina: centinaia di strati sottilissimi per una superficie liscia e piena di dettagli." },
  { icon: Sparkles, k: "La rifinitura", title: "Pulita, levigata, controllata.", text: "Ogni statuetta viene rifinita a mano e controllata prima di partire. Arriva bianca, pronta per il colore." },
  { icon: Palette, k: "La pittura", title: "Il tocco finale è il tuo.", text: "Nel kit trovi colori scelti sulla tua foto, pennelli e una guida illustrata. Nessuna esperienza richiesta." },
  { icon: Gift, k: "Il regalo", title: "E poi, si regala.", text: "Confezionata in una scatola pensata per essere aperta davanti a qualcuno. Il momento migliore è proprio quello." },
];

export function StoryPage() {
  const story = useRef<HTMLElement>(null);
  const progress = useScrollProgress(story);
  const [active, setActive] = useState(0);

  // Track which chapter is centred (for the side index).
  useEffect(() => {
    const els = story.current?.querySelectorAll<HTMLElement>("[data-chapter]");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.getAttribute("data-chapter")))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  return (
    <main>
      <section className="px-4 pb-10 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <Eyebrow className="text-violet-deep">Come funziona</Eyebrow>
          <RevealText as="h1" text={"Dalla foto\nalla tua mensola."} className="text-display mt-4 text-[14vw] md:text-[8vw]" />
          <FadeIn delay={0.3} className="mt-6 max-w-lg text-lg text-ink-soft">
            Sei passaggi, una statuetta che ti accompagna. Scorri per seguirla dal primo scatto fino al pacchetto regalo.
          </FadeIn>
        </div>
      </section>

      <section ref={story} className="relative grid lg:grid-cols-2" aria-label="Il processo MiniMe">
        {/* 3D guide */}
        <div className="absolute inset-0 lg:relative lg:order-2">
          <div className="sticky top-0 z-0 h-[52svh] overflow-hidden bg-cream lg:h-[100svh]">
            <div aria-hidden className="absolute inset-4 rounded-[36px] bg-[radial-gradient(70%_60%_at_50%_55%,#ffffff_0%,#f3eefc_60%,#ebe4ff_100%)] lg:inset-8 lg:top-24" />
            <div className="absolute inset-4 lg:inset-8 lg:top-24">
              <Stage camera={{ position: [0, 1.5, 7], fov: 32 }}>
                <StoryScene progress={progress} />
              </Stage>
            </div>
            <ol className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex" aria-hidden>
              {CHAPTERS.map((c, i) => (
                <li key={c.k} className={`h-6 w-1 rounded-full transition-all duration-500 ${i === active ? "h-10 bg-violet" : "bg-ink/15"}`} />
              ))}
            </ol>
          </div>
        </div>

        {/* Chapters */}
        <div className="relative z-10 px-4 pt-[46svh] md:px-8 lg:order-1 lg:pt-0">
          {CHAPTERS.map((c, i) => (
            <article key={c.k} data-chapter={i} className="flex min-h-[85svh] items-end py-8 lg:min-h-[100svh] lg:items-center lg:py-10">
              <FadeIn className="max-w-md rounded-[28px] bg-white/85 p-6 shadow-[0_20px_60px_-40px_rgba(36,36,36,0.4)] backdrop-blur-md lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-butter">
                    <c.icon className="size-5" />
                  </span>
                  <span className="text-eyebrow text-ink/50">
                    {String(i + 1).padStart(2, "0")} · {c.k}
                  </span>
                </div>
                <h2 className="text-display mt-5 text-4xl md:text-6xl">{c.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">{c.text}</p>
              </FadeIn>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 rounded-[40px] bg-violet p-8 text-white md:flex-row md:items-end md:p-14">
          <h2 className="text-display text-5xl md:text-7xl">
            Facile, no?
            <br />
            Inizia dalla tua foto.
          </h2>
          <Button href="/crea" variant="light" size="lg">
            Crea la tua MiniMe
          </Button>
        </div>
      </section>
    </main>
  );
}
