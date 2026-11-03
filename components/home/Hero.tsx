"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { asset } from "@/lib/asset";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { MousePointer2, Sparkles } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Button, RevealText } from "@/components/site/ui";
import { useIsSmall, useReducedMotion } from "@/lib/device";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const small = useIsSmall();
  const [landed, setLanded] = useState(false);
  const onLanded = useCallback(() => setLanded(true), []);

  // Safety net: reveal the copy even if WebGL is slow or unavailable.
  useEffect(() => {
    const id = window.setTimeout(() => setLanded(true), 3200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-cream" aria-labelledby="hero-title">
      {/* soft studio backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[58%] size-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(165,139,250,0.18),rgba(249,220,229,0.12)_45%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cream-deep/70 to-transparent" />
      </div>

      {/* Editorial headline (behind the statuette) */}
      <h1 id="hero-title" className="text-display pointer-events-none absolute inset-0 z-0 select-none uppercase">
        <RevealText
          text={"Le persone\nche ami."}
          play={landed}
          className="absolute left-4 top-[15svh] text-[15vw] md:left-8 md:top-[17svh] md:text-[7.6vw] xl:text-[7.2vw]"
        />
        <RevealText
          text={"In versione\nmini."}
          play={landed}
          delay={0.25}
          className="absolute bottom-[25svh] right-4 text-right text-[12.5vw] text-violet md:bottom-auto md:right-8 md:top-[45svh] md:text-[6.4vw] xl:text-[6vw]"
        />
      </h1>

      {/* 3D statuette */}
      <div className="absolute inset-0 z-10">
        <Stage
          eager
          fallback={
            <div className="grid h-full place-items-center">
              <Image src={asset("/images/minime-couple.webp")} alt="Statuetta MiniMe di una coppia che si abbraccia" width={520} height={520} priority className="mt-24 w-[min(62vw,420px)] rounded-[36px] shadow-[0_40px_80px_-40px_rgba(36,36,36,0.35)]" />
            </div>
          }
        >
          <HeroScene onLanded={onLanded} reduced={reduced} small={small} />
        </Stage>
      </div>

      {/* Foreground copy */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-6 md:px-8 md:pb-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            className="pointer-events-auto max-w-md"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={landed ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.6 }}
          >
            <p className="text-balance text-lg font-medium leading-snug text-ink/80 md:text-xl">
              Da una foto a una statuetta tutta tua. <span className="text-ink">Creala, ricevila, colorala.</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/crea">Crea la tua MiniMe</Button>
              <Button href="/kit" variant="ghost">
                Scopri il kit
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Side chips */}
      <motion.div
        className="pointer-events-none absolute right-8 top-28 z-20 hidden flex-col items-end gap-2 md:flex"
        initial={reduced ? false : { opacity: 0, x: 20 }}
        animate={landed ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 1, ease, delay: 0.9 }}
      >
        <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-semibold ring-1 ring-ink/5 backdrop-blur">15 cm · resina opaca</span>
        <span className="rounded-full bg-butter px-4 py-2 text-[13px] font-semibold">Kit pittura incluso</span>
        <span className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-cream">
          <Sparkles className="size-3.5" /> da 29,90 €
        </span>
      </motion.div>

      <motion.p
        className="pointer-events-none absolute bottom-10 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink/50 lg:flex"
        initial={{ opacity: 0 }}
        animate={landed ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <MousePointer2 className="size-3.5" /> Trascina per ruotare · scorri
      </motion.p>
    </section>
  );
}
