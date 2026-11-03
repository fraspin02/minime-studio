"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ImagePlus, RotateCcw, Shuffle, Sparkles, X, Lock, Rotate3d } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Eyebrow } from "@/components/site/ui";
import type { FigureConfig } from "@/components/three/figurine/types";
import {
  ACCESSORIES,
  ACCESSORY_COLOR,
  BOTTOM_COLORS,
  DEFAULT_CONFIG,
  HAIR,
  HAIR_COLORS,
  OUTFITS,
  OUTFIT_COLORS,
  POSES,
  SKINS,
} from "./options";

const ConfiguratorScene = dynamic(() => import("./ConfiguratorScene"), { ssr: false });

const COLOR_NAMES: Record<string, string> = {
  "#2b211c": "Castano scuro",
  "#6b4630": "Castano",
  "#a8713f": "Nocciola",
  "#d9b06c": "Biondo",
  "#c4593b": "Rosso",
  "#b9b3ad": "Grigio",
  "#a58bfa": "Lavanda",
  "#1f1f22": "Nero",
  "#fbfaf7": "Bianco",
  "#ffe29a": "Giallo pastello",
  "#f9dce5": "Rosa",
  "#bfd2ec": "Azzurro",
  "#9fc49a": "Salvia",
  "#d4584f": "Rosso corallo",
  "#ece5d8": "Panna",
  "#3c4a66": "Denim",
  "#f6f3ee": "Bianco latte",
  "#c9b8f5": "Lilla",
  "#9b7b5c": "Cammello",
};

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function Configurator() {
  const [config, setConfig] = useState<FigureConfig>(DEFAULT_CONFIG);
  const [painted, setPainted] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FigureConfig>(k: K, v: FigureConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));

  const shuffle = () =>
    setConfig((c) => {
      const accessory = pick(ACCESSORIES).v;
      return {
        ...c,
        hair: pick(HAIR).v,
        hairColor: pick(HAIR_COLORS),
        outfit: pick(OUTFITS).v,
        topColor: pick(OUTFIT_COLORS),
        bottomColor: pick(BOTTOM_COLORS),
        skin: pick(SKINS).v,
        accessory,
        accessoryColor: ACCESSORY_COLOR[accessory],
        pose: pick(POSES).v,
      };
    });

  return (
    <main className="px-4 pb-20 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow className="text-violet-deep">Configuratore · demo</Eyebrow>
            <h1 className="text-display mt-3 text-5xl md:text-7xl">Crea la tua MiniMe</h1>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
            Gioca con capelli, vestiti, accessori e posa: l&apos;anteprima 3D si aggiorna in tempo reale. Le opzioni sono indicative della personalizzazione finale.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(340px,440px)_1fr]">
          {/* ---------------- Controls ---------------- */}
          <div className="order-2 space-y-4 lg:order-1">
            <Panel title="La tua foto" step="01">
              <PhotoDrop photo={photo} onPhoto={setPhoto} />
            </Panel>

            <Panel title="Capelli" step="02">
              <Chips options={HAIR} value={config.hair} onChange={(v) => set("hair", v)} />
              <Label>Colore capelli</Label>
              <Swatches colors={HAIR_COLORS} value={config.hairColor} onChange={(v) => set("hairColor", v)} />
            </Panel>

            <Panel title="Vestiti" step="03">
              <Chips options={OUTFITS} value={config.outfit} onChange={(v) => set("outfit", v)} />
              <Label>Colore vestiti</Label>
              <Swatches colors={OUTFIT_COLORS} value={config.topColor} onChange={(v) => set("topColor", v)} />
              {config.outfit !== "gown" && config.outfit !== "dress" && (
                <>
                  <Label>{config.outfit === "crop" ? "Colore gonna" : "Colore pantaloni"}</Label>
                  <Swatches colors={BOTTOM_COLORS} value={config.bottomColor} onChange={(v) => set("bottomColor", v)} />
                </>
              )}
              <Label>Carnagione</Label>
              <Swatches colors={SKINS.map((s) => s.v)} labels={Object.fromEntries(SKINS.map((s) => [s.v, s.l]))} value={config.skin} onChange={(v) => set("skin", v)} />
            </Panel>

            <Panel title="Accessori" step="04">
              <Chips
                options={ACCESSORIES}
                value={config.accessory}
                onChange={(v) => setConfig((c) => ({ ...c, accessory: v, accessoryColor: ACCESSORY_COLOR[v] }))}
              />
            </Panel>

            <Panel title="Posa" step="05">
              <Chips options={POSES} value={config.pose} onChange={(v) => set("pose", v)} />
            </Panel>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={shuffle} className="flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold ring-1 ring-ink/10 hover:ring-ink/30">
                <Shuffle className="size-4" /> Sorprendimi
              </button>
              <button type="button" onClick={() => setConfig(DEFAULT_CONFIG)} className="flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold ring-1 ring-ink/10 hover:ring-ink/30">
                <RotateCcw className="size-4" /> Ripristina
              </button>
            </div>
          </div>

          {/* ---------------- Viewer ---------------- */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="relative h-[58svh] min-h-[400px] overflow-hidden rounded-[36px] bg-[radial-gradient(70%_70%_at_50%_45%,#ffffff_0%,#f3eefc_60%,#e9e1ff_100%)] lg:h-[calc(100svh-8rem)]">
                <Stage
                  eager
                  camera={{ position: [2.0, 2.1, 6.6], fov: 32 }}
                  fallback={<div className="grid h-full place-items-center p-8 text-center text-ink-soft">L&apos;anteprima 3D richiede WebGL. Puoi comunque scegliere le opzioni a sinistra.</div>}
                >
                  <ConfiguratorScene config={config} painted={painted} />
                </Stage>

                <div className="absolute left-4 top-4 inline-flex rounded-full bg-white/85 p-1 ring-1 ring-ink/5 backdrop-blur" role="radiogroup" aria-label="Finitura anteprima">
                  {[
                    { v: true, l: "Colorata" },
                    { v: false, l: "Bianca" },
                  ].map((o) => (
                    <button
                      key={o.l}
                      type="button"
                      role="radio"
                      aria-checked={painted === o.v}
                      onClick={() => setPainted(o.v)}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${painted === o.v ? "bg-ink text-cream" : "text-ink/60"}`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                {photo && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/85 py-1 pl-1 pr-3 text-[12px] font-semibold ring-1 ring-ink/5 backdrop-blur">
                    <Image src={photo} alt="" width={28} height={28} unoptimized className="size-7 rounded-full object-cover" />
                    Foto di riferimento
                  </div>
                )}
                <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-ink/60 backdrop-blur">
                  <Rotate3d className="size-3.5" /> Trascina per ruotare
                </span>
              </div>

              <div className="mt-4 flex flex-col items-stretch justify-between gap-4 rounded-[28px] bg-ink p-5 text-cream sm:flex-row sm:items-center">
                <div>
                  <p className="text-[13px] text-cream/60">MiniMe Color Kit</p>
                  <p className="text-2xl font-extrabold tracking-tight">29,90 €</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDone(true)}
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-violet px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink"
                >
                  <Sparkles className="size-4" /> Completa la mia MiniMe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{done && <SoonModal onClose={() => setDone(false)} />}</AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function Panel({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white p-5 ring-1 ring-ink/5 md:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold tracking-tight">
        <span className="text-[12px] font-bold text-violet-deep">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/45">{children}</p>;
}

function Chips<T extends string>({ options, value, onChange }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const on = o.v === value;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.v)}
            className="relative rounded-full px-4 py-2 text-[14px] font-semibold ring-1 ring-ink/10 transition-colors hover:ring-ink/30"
          >
            {on && <motion.span layoutId={`chip-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className={`relative ${on ? "text-cream" : "text-ink/75"}`}>{o.l}</span>
          </button>
        );
      })}
    </div>
  );
}

function Swatches({ colors, value, onChange, labels }: { colors: string[]; value: string; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup">
      {colors.map((c) => {
        const on = c === value;
        const name = labels?.[c] ?? COLOR_NAMES[c] ?? c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={name}
            title={name}
            onClick={() => onChange(c)}
            className={`grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-white transition-transform hover:scale-110 ${on ? "ring-2 ring-ink" : "ring-1 ring-ink/10"}`}
            style={{ background: c }}
          >
            {on && <Check className="size-4" strokeWidth={3} color={isLight(c) ? "#242424" : "#fff"} />}
          </button>
        );
      })}
    </div>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

/** Local-only photo picker: previews via object URL, nothing leaves the device. */
function PhotoDrop({ photo, onPhoto }: { photo: string | null; onPhoto: (u: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const current = useRef<string | null>(null);

  useEffect(() => () => {
    if (current.current) URL.revokeObjectURL(current.current);
  }, []);

  const handle = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (current.current) URL.revokeObjectURL(current.current);
    const url = URL.createObjectURL(file);
    current.current = url;
    onPhoto(url);
  };

  const clear = () => {
    if (current.current) URL.revokeObjectURL(current.current);
    current.current = null;
    onPhoto(null);
    if (input.current) input.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex min-h-[140px] items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors ${drag ? "border-violet bg-lavender" : "border-ink/15 bg-cream"}`}
      >
        {photo ? (
          <>
            <Image src={photo} alt="Anteprima della foto scelta" width={104} height={104} unoptimized className="size-[104px] shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Foto caricata</p>
              <p className="text-[13px] text-ink-soft">Usata solo come riferimento visivo in questa pagina.</p>
              <button type="button" onClick={clear} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-violet-deep hover:underline">
                <X className="size-3.5" /> Rimuovi
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 py-2 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-white shadow-sm ring-1 ring-ink/5">
              <ImagePlus className="size-5 text-violet-deep" />
            </span>
            <span className="font-semibold">Trascina qui una foto o sfoglia</span>
            <span className="text-[12px] text-ink/50">JPG, PNG o HEIC · viso e vestiti ben visibili</span>
          </button>
        )}
        <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => handle(e.target.files?.[0])} aria-label="Scegli una foto" />
      </div>
      <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-snug text-ink/50">
        <Lock className="mt-0.5 size-3 shrink-0" /> Demo: la foto resta sul tuo dispositivo e non viene inviata. Il modello 3D non viene generato dalla foto.
      </p>
    </div>
  );
}

function SoonModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="soon-title"
    >
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-cream p-8 text-center shadow-2xl"
        initial={{ y: 40, scale: 0.94 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-butter blur-2xl" />
        <div aria-hidden className="absolute -bottom-12 -left-10 size-40 rounded-full bg-blush blur-2xl" />
        <div className="relative">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-violet text-white">
            <Sparkles className="size-6" />
          </span>
          <h2 id="soon-title" className="text-display mt-5 text-4xl">
            Presto potrai creare la tua MiniMe!
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Stiamo preparando il laboratorio. Questa è una demo: nessun ordine è stato creato e nessun dato è stato inviato.
          </p>
          <button type="button" onClick={onClose} className="mt-6 h-12 rounded-full bg-ink px-7 font-semibold text-cream hover:bg-violet-deep" autoFocus>
            Continua a giocare
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
