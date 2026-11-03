"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Stage } from "@/components/three/Stage";
import { Button, FadeIn } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useIsSmall } from "@/lib/device";

const FinalCtaScene = dynamic(() => import("./FinalCtaScene"), { ssr: false });

export function FinalCta() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section, { start: "top bottom", end: "top top" });
  const small = useIsSmall();

  return (
    <section ref={section} className="relative min-h-[100svh] overflow-hidden bg-violet text-white" aria-labelledby="cta-title">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_60%,#c5b4ff_0%,#a58bfa_55%,#8f72f2_100%)]" />
      <div aria-hidden className="absolute -left-20 top-1/3 size-72 rounded-full bg-butter/40 blur-3xl" />
      <div aria-hidden className="absolute bottom-10 right-1/4 size-80 rounded-full bg-blush/50 blur-3xl" />

      <div className="absolute inset-0">
        <Stage studio fallback={null}>
          <FinalCtaScene progress={progress} small={small} />
        </Stage>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-start px-4 pt-28 md:justify-center md:px-8 md:pt-0">
        <FadeIn>
          <h2 id="cta-title" className="text-display text-[19vw] md:text-[10.5vw]">
            Ora
            <br />
            tocca
            <br />a te.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15} className="mt-6 max-w-md">
          <p className="text-lg font-medium leading-snug text-white/85 md:text-2xl">Il tuo prossimo regalo potrebbe avere il tuo stesso sorriso.</p>
        </FadeIn>
        <FadeIn delay={0.25} className="pointer-events-auto mt-8">
          <Button href="/crea" variant="light" size="lg">
            Crea la tua MiniMe
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
