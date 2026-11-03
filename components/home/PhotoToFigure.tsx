"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { asset } from "@/lib/asset";
import { useRef } from "react";
import { Stage } from "@/components/three/Stage";
import { Eyebrow } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useScrubTimeline } from "@/lib/useScrubTimeline";
import { useIsSmall } from "@/lib/device";

const TransformScene = dynamic(() => import("./TransformScene"), { ssr: false });

export function PhotoToFigure() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const small = useIsSmall();

  useScrubTimeline(section, (tl) => {
    tl.fromTo("[data-a='l1']", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.1 }, 0.04)
      .fromTo("[data-a='tag1']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08 }, 0.08)
      .to("[data-a='l1']", { yPercent: -60, opacity: 0, duration: 0.1 }, 0.4)
      .to("[data-a='tag1']", { opacity: 0, duration: 0.06 }, 0.4)
      .fromTo("[data-a='l2']", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.12 }, 0.6)
      .fromTo("[data-a='tag2']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08 }, 0.7)
      .fromTo("[data-a='bar']", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, 0);
  });

  return (
    <section ref={section} className="relative h-[340vh] bg-cream" aria-label="Da una foto a una statuetta">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,#fff_0%,rgba(250,248,244,0)_70%)]" />
        <div className="absolute inset-0">
          <Stage
            fallback={
              <div className="grid h-full place-items-center">
                <Image src={asset("/images/minime-couple.webp")} alt="Statuetta MiniMe nata da una foto" width={460} height={460} className="w-[min(62vw,400px)] rounded-[36px] shadow-[0_40px_80px_-40px_rgba(36,36,36,0.35)]" />
              </div>
            }
          >
            <TransformScene progress={progress} small={small} />
          </Stage>
        </div>

        {/* Overlay copy */}
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 px-4 md:top-28 md:px-8">
          <div className="mx-auto max-w-[1440px]">
            <Eyebrow className="text-ink/60">La trasformazione</Eyebrow>
            <h2 className="text-display mt-4 text-[12vw] md:text-[6.4vw]">
              <span className="block overflow-hidden">
                <span data-a="l1" className="block">Da una foto.</span>
              </span>
              <span className="block overflow-hidden">
                <span data-a="l2" className="block text-violet">A qualcosa di unico.</span>
              </span>
            </h2>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 px-4 md:bottom-12 md:px-8">
          <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6">
            <div className="relative h-24 w-[min(24rem,78vw)]">
              <p data-a="tag1" className="absolute bottom-0 text-[15px] leading-relaxed text-ink-soft">
                Ci basta una foto nitida delle persone che vuoi trasformare. Niente pose da studio: va bene anche quella del cuore.
              </p>
              <p data-a="tag2" className="absolute bottom-0 text-[15px] leading-relaxed text-ink-soft">
                I nostri artisti la reinterpretano in chiave cartoon: stessi capelli, stessi vestiti, stesso abbraccio.
              </p>
            </div>
            <div className="hidden w-48 md:block">
              <p className="text-eyebrow mb-3 text-ink/40">Scorri</p>
              <div className="h-[2px] w-full overflow-hidden rounded bg-ink/10">
                <div data-a="bar" className="h-full origin-left bg-ink" />
              </div>
            </div>
          </div>
          <p className="mx-auto mt-3 max-w-[1440px] text-[11px] text-ink/40">Animazione dimostrativa del processo: nessuna generazione automatica dalla foto.</p>
        </div>
      </div>
    </section>
  );
}
