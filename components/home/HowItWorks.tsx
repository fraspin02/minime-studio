"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Camera, Printer, Palette } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Eyebrow } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useScrubTimeline } from "@/lib/useScrubTimeline";
import { useIsSmall } from "@/lib/device";

const StepsScene = dynamic(() => import("./StepsScene"), { ssr: false });

const STEPS = [
  {
    n: "01",
    icon: Camera,
    title: "Scegli chi trasformare",
    text: "Una coppia, un'amica, il tuo cane, tua nonna il giorno della laurea. Scegli una o più foto in cui si vedono bene viso, capelli e vestiti.",
  },
  {
    n: "02",
    icon: Printer,
    title: "Noi creiamo la tua MiniMe",
    text: "La reinterpretiamo in stile cartoon e la stampiamo in 3D, strato dopo strato, in resina opaca. Circa 15 cm di personalità.",
  },
  {
    n: "03",
    icon: Palette,
    title: "Tu le dai colore",
    text: "Arriva bianca, con pennelli e colori selezionati. Il bello è dipingerla: da soli, in coppia o come attività da regalare.",
  },
];

export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const small = useIsSmall();

  useScrubTimeline(section, (tl) => {
    const show = (i: number, at: number) =>
      tl.fromTo(`[data-step='${i}']`, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.08 }, at).fromTo(
        `[data-dot='${i}']`,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.3, ease: "none" },
        at
      );
    const hide = (i: number, at: number) => tl.to(`[data-step='${i}']`, { opacity: 0, y: -60, duration: 0.07, ease: "power2.in" }, at);
    show(0, 0.0);
    hide(0, 0.25);
    show(1, 0.36);
    hide(1, 0.61);
    show(2, 0.72);
  });

  return (
    <section ref={section} className="relative h-[420vh] bg-cream" aria-labelledby="how-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-cream via-[#f6f1fb] to-cream" />
        <div className="absolute inset-0">
          <Stage fallback={<div className="h-full bg-lavender/40" />}>
            <StepsScene progress={progress} small={small} />
          </Stage>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 px-4 md:px-8">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-between pb-10 pt-24 md:pb-16 md:pt-32">
            <div>
              <Eyebrow className="text-ink/60">Come funziona</Eyebrow>
              <h2 id="how-title" className="text-display mt-3 text-4xl md:text-6xl">
                Tre passi. <span className="text-ink/35">Zero stress.</span>
              </h2>
            </div>

            <div className="relative h-[220px] max-w-md md:h-[260px]">
              {STEPS.map((s, i) => (
                <article
                  key={s.n}
                  data-step={i}
                  className="absolute inset-x-0 bottom-0 rounded-[28px] bg-white/80 p-6 opacity-0 shadow-[0_30px_80px_-40px_rgba(36,36,36,0.35)] ring-1 ring-ink/5 backdrop-blur-md md:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-5xl font-extrabold tracking-tighter text-violet md:text-6xl">{s.n}</span>
                    <span className="grid size-11 place-items-center rounded-full bg-butter">
                      <s.icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-[28px]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.text}</p>
                </article>
              ))}
            </div>

            <div className="flex max-w-md gap-2" aria-hidden>
              {STEPS.map((s, i) => (
                <div key={s.n} className="h-[3px] flex-1 overflow-hidden rounded bg-ink/10">
                  <div data-dot={i} className="h-full origin-left bg-ink" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
