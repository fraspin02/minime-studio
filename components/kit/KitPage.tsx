"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { asset } from "@/lib/asset";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Brush, Droplets, BookOpen, Gift, Ruler, Package, Rotate3d, ZoomIn, MousePointerClick, ShieldCheck } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Button, Eyebrow, FadeIn, RevealText } from "@/components/site/ui";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useIsSmall } from "@/lib/device";

const KitViewerScene = dynamic(() => import("./KitViewerScene"), { ssr: false });
const KitUnboxing = dynamic(() => import("@/components/three/KitUnboxing"), { ssr: false });

const COMPONENTS = [
  { icon: Package, title: "La tua MiniMe", text: "Statuetta cartoon in resina opaca, circa 15 cm, pronta da dipingere." },
  { icon: Droplets, title: "6 colori acrilici", text: "Tonalità scelte sulla tua foto: pelle, capelli, vestiti e dettagli." },
  { icon: Brush, title: "3 pennelli", text: "Uno piatto per le campiture, due a punta fine per occhi e rifiniture." },
  { icon: BookOpen, title: "Guida colori", text: "Una mappa illustrata: quale colore va dove, passo dopo passo." },
];

const SPECS = [
  { icon: Ruler, k: "Altezza", v: "~15 cm" },
  { icon: ShieldCheck, k: "Materiale", v: "Resina opaca" },
  { icon: Gift, k: "Confezione", v: "Scatola regalo" },
];

export function KitPage() {
  const [painted, setPainted] = useState(false);
  const [showKit, setShowKit] = useState(false);
  const [hotspots, setHotspots] = useState(false);
  const unbox = useRef<HTMLElement>(null);
  const progress = useScrollProgress(unbox);
  const small = useIsSmall();

  return (
    <main>
      {/* ---------- Product hero ---------- */}
      <section className="relative px-4 pb-16 pt-28 md:px-8 md:pt-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-[1fr_1.25fr]">
          <div className="order-2 lg:order-1">
            <Eyebrow className="text-violet-deep">Il kit</Eyebrow>
            <RevealText as="h1" text={"MiniMe\nColor Kit"} className="text-display mt-4 text-[17vw] lg:text-[7.5vw]" />
            <FadeIn delay={0.3}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
                La tua statuetta arriva bianca, insieme a tutto ciò che serve per colorarla. Un regalo da aprire, e un pomeriggio da passare insieme.
              </p>
              <div className="mt-8 flex items-end gap-4">
                <p className="text-5xl font-extrabold tracking-tight">29,90 €</p>
                <p className="pb-1.5 text-[13px] text-ink/50">prezzo indicativo · IVA incl.</p>
              </div>

              <fieldset className="mt-8">
                <legend className="text-eyebrow mb-3 text-ink/50">Finitura</legend>
                <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10" role="radiogroup">
                  {[
                    { v: false, l: "Bianca, da dipingere" },
                    { v: true, l: "Esempio colorato" },
                  ].map((o) => (
                    <button
                      key={o.l}
                      type="button"
                      role="radio"
                      aria-checked={painted === o.v}
                      onClick={() => setPainted(o.v)}
                      className="relative rounded-full px-4 py-2.5 text-[14px] font-semibold"
                    >
                      {painted === o.v && <motion.span layoutId="finish" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                      <span className={`relative ${painted === o.v ? "text-cream" : "text-ink/70"}`}>{o.l}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-4 flex flex-wrap gap-2">
                <Toggle on={showKit} onClick={() => setShowKit((s) => !s)}>
                  Mostra componenti del kit
                </Toggle>
                <Toggle on={hotspots} onClick={() => setHotspots((s) => !s)}>
                  Osserva i dettagli
                </Toggle>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/crea" size="lg">
                  Acquista · personalizza
                </Button>
              </div>
              <p className="mt-3 text-[12px] text-ink/45">Prototipo: il pulsante porta alla demo di personalizzazione, nessun pagamento.</p>
            </FadeIn>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative h-[62svh] min-h-[420px] overflow-hidden rounded-[36px] bg-[radial-gradient(70%_70%_at_50%_45%,#ffffff_0%,#f3eefc_60%,#e9e1ff_100%)] lg:h-[78svh]">
              <Stage
                eager
                camera={{ position: [2.6, 2.2, 5.6], fov: 32 }}
                fallback={
                  <div className="grid h-full place-items-center">
                    <Image src={asset("/images/minime-couple.webp")} alt="Esempio di statuetta MiniMe" width={420} height={420} className="w-[70%] rounded-[32px]" />
                  </div>
                }
              >
                <KitViewerScene painted={painted} showKit={showKit} showHotspots={hotspots} />
              </Stage>
              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap justify-center gap-2 text-[12px] font-semibold text-ink/60">
                <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 backdrop-blur"><Rotate3d className="size-3.5" /> Trascina per ruotare</span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 backdrop-blur"><ZoomIn className="size-3.5" /> Pizzica / rotella per zoom</span>
                {hotspots && <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 backdrop-blur"><MousePointerClick className="size-3.5" /> Tocca i numeri</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1440px] grid-cols-3 gap-3">
          {SPECS.map((s) => (
            <div key={s.k} className="rounded-3xl bg-white p-5 ring-1 ring-ink/5">
              <s.icon className="size-5 text-violet-deep" />
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink/45">{s.k}</p>
              <p className="text-lg font-bold tracking-tight md:text-xl">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- What's inside ---------- */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <FadeIn>
            <Eyebrow className="text-ink/60">Cosa c'è dentro</Eyebrow>
            <h2 className="text-display mt-3 max-w-3xl text-5xl md:text-7xl">Tutto il necessario. Niente di superfluo.</h2>
          </FadeIn>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPONENTS.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.08}>
                <article className="group h-full rounded-[28px] bg-white p-7 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(79,55,170,0.45)]">
                  <span className={`grid size-12 place-items-center rounded-2xl ${["bg-lavender", "bg-butter", "bg-blush", "bg-cream-deep"][i]}`}>
                    <c.icon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold tracking-tight">{c.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{c.text}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Scroll unboxing ---------- */}
      <section ref={unbox} className="relative h-[280vh] bg-lavender" aria-labelledby="unbox-title">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_55%,#f7f3ff_0%,#ece6ff_55%,#ddd2ff_100%)]" />
          <div className="absolute inset-0">
            <Stage fallback={null}>
              <KitUnboxing progress={progress} small={small} framing="center" />
            </Stage>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-24 z-10 text-center md:top-28">
            <p className="text-eyebrow text-violet-deep">Unboxing</p>
            <h2 id="unbox-title" className="text-display mt-3 text-5xl md:text-7xl">
              Scorri per aprirlo.
            </h2>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 rounded-[40px] bg-ink p-8 text-cream md:flex-row md:items-end md:p-14">
          <h2 className="text-display text-5xl md:text-7xl">
            Pronto a crearne
            <br />
            una <span className="text-violet">tutta tua?</span>
          </h2>
          <Button href="/crea" variant="light" size="lg">
            Personalizza la tua MiniMe
          </Button>
        </div>
      </section>
    </main>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[14px] font-semibold ring-1 transition-colors ${on ? "bg-violet text-white ring-violet" : "bg-white text-ink/70 ring-ink/10 hover:ring-ink/30"}`}
    >
      <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-white/40" : "bg-ink/15"}`}>
        <span className={`absolute top-0.5 size-3 rounded-full bg-white shadow transition-all ${on ? "left-3.5" : "left-0.5"}`} />
      </span>
      {children}
    </button>
  );
}
