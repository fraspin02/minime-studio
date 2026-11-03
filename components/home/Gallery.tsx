"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Stage } from "@/components/three/Stage";
import { Eyebrow } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useScrubTimeline } from "@/lib/useScrubTimeline";
import { useIsSmall } from "@/lib/device";
import { GALLERY_ITEMS } from "./galleryData";

const GalleryScene = dynamic(() => import("./GalleryScene"), { ssr: false });

const STORIES: Record<string, string> = {
  coppia: "Il vostro primo bacio, il vostro abbraccio di sempre.",
  laurea: "Tocco, corona d'alloro e un sorriso da 110 e lode.",
  amici: "Quella foto di gruppo che merita uno scaffale tutto suo.",
  pet: "Perché anche lui fa parte della famiglia.",
  compleanno: "Una candelina che non si spegne più.",
};

export function Gallery() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const small = useIsSmall();
  const [active, setActive] = useState(0);
  const onActive = useCallback((i: number) => setActive(i), []);

  useScrubTimeline(section, (tl) => {
    tl.fromTo("[data-g='bar']", { scaleX: 0.2 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
  });

  const item = GALLERY_ITEMS[Math.max(0, Math.min(GALLERY_ITEMS.length - 1, active))];

  return (
    <section ref={section} className="relative h-[460vh] bg-cream" aria-labelledby="gallery-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_70%,#ffffff_0%,#faf8f4_60%,#f2eee6_100%)]" />
        <div className="absolute inset-0">
          <Stage fallback={<div className="h-full" />}>
            <GalleryScene progress={progress} small={small} onActive={onActive} />
          </Stage>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 px-4 md:px-8">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-between pb-8 pt-24 md:pb-12 md:pt-32">
            <div className="flex items-start justify-between gap-6">
              <div>
                <Eyebrow className="text-ink/60">Galleria</Eyebrow>
                <h2 id="gallery-title" className="text-display mt-3 text-4xl md:text-6xl">
                  Ogni storia ha
                  <br />
                  la sua <span className="text-violet">MiniMe.</span>
                </h2>
              </div>
              <p className="hidden pt-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink/40 md:block">
                Passa sopra una statuetta
              </p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div className="min-h-[110px] max-w-sm" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-eyebrow text-ink/40">
                      {String(active + 1).padStart(2, "0")} / {String(GALLERY_ITEMS.length).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{item.label}</p>
                    <p className="mt-1 text-[15px] text-ink-soft">{STORIES[item.key]}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="hidden w-64 md:block">
                <div className="flex justify-between text-[12px] font-semibold text-ink/40">
                  {GALLERY_ITEMS.map((g, i) => (
                    <span key={g.key} className={i === active ? "text-ink" : ""}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                <div className="mt-2 h-[2px] overflow-hidden rounded bg-ink/10">
                  <div data-g="bar" className="h-full origin-left bg-ink" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
