"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Check, Hand } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Button, Eyebrow } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useScrubTimeline } from "@/lib/useScrubTimeline";
import { useIsSmall } from "@/lib/device";

const KitUnboxing = dynamic(() => import("@/components/three/KitUnboxing"), { ssr: false });

const INCLUDED = ["Statuetta MiniMe ~15 cm in resina", "6 colori acrilici selezionati", "3 pennelli di precisione", "Guida colori illustrata"];

export function KitReveal() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const small = useIsSmall();

  useScrubTimeline(section, (tl) => {
    tl.fromTo("[data-k='title'] > span > span", { yPercent: 110 }, { yPercent: 0, stagger: 0.04, duration: 0.12 }, 0.02)
      .fromTo("[data-k='card']", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.12 }, 0.55)
      .fromTo("[data-k='item']", { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.04, duration: 0.08 }, 0.62)
      .fromTo("[data-k='hint']", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.85);
  });

  return (
    <section ref={section} className="relative h-[320vh] bg-lavender" aria-labelledby="kit-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_65%_55%,#f7f3ff_0%,#ece6ff_55%,#ddd2ff_100%)]" />
        <div className="absolute inset-0">
          <Stage fallback={<div className="h-full" />}>
            <KitUnboxing progress={progress} small={small} />
          </Stage>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 px-4 md:px-8">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-between pb-8 pt-24 md:justify-center md:pb-0 md:pt-0">
            <div className="max-w-xl">
              <Eyebrow className="text-violet-deep">Il kit</Eyebrow>
              <h2 id="kit-title" data-k="title" className="text-display mt-4 text-[14vw] md:text-[7vw]">
                {["Apri.", "Colora.", "Sorridi."].map((w) => (
                  <span key={w} className="block overflow-hidden">
                    <span className="block">{w}</span>
                  </span>
                ))}
              </h2>
            </div>

            <div data-k="card" className="pointer-events-auto mt-8 max-w-sm rounded-[28px] bg-white/85 p-6 shadow-[0_40px_90px_-50px_rgba(79,55,170,0.6)] ring-1 ring-white backdrop-blur-md">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xl font-bold tracking-tight">MiniMe Color Kit</p>
                <p className="text-2xl font-extrabold tracking-tight">29,90 €</p>
              </div>
              <ul className="mt-4 hidden space-y-2 sm:block">
                {INCLUDED.map((i) => (
                  <li key={i} data-k="item" className="flex items-center gap-2.5 text-[14px] text-ink-soft">
                    <span className="grid size-5 place-items-center rounded-full bg-violet/15 text-violet-deep">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Button href="/kit" variant="dark">
                  Scopri il kit
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p data-k="hint" className="pointer-events-none absolute bottom-6 right-6 z-10 hidden items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-violet-deep/70 md:flex">
          <Hand className="size-4" /> Trascina per ruotare il kit
        </p>
      </div>
    </section>
  );
}
