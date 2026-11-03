"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Stage } from "@/components/three/Stage";
import { Button, Eyebrow, FadeIn, RevealText } from "@/components/site/ui";

const FaqFigure = dynamic(() => import("./FaqFigure"), { ssr: false });

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Il prodotto",
    items: [
      { q: "Quanto è grande una MiniMe?", a: "Circa 15 cm di altezza, base compresa. Abbastanza grande per i dettagli, abbastanza piccola per qualsiasi mensola o scrivania." },
      { q: "Di che materiale è fatta?", a: "Resina opaca stampata in 3D e rifinita a mano. È rigida, leggera e ha una superficie liscia che accoglie bene i colori acrilici." },
      { q: "Cosa contiene il kit?", a: "La statuetta bianca, 6 colori acrilici scelti in base alla tua foto, 3 pennelli (uno piatto e due a punta fine) e una guida colori illustrata." },
      { q: "Quanto costa?", a: "Il prezzo indicativo del MiniMe Color Kit è di 29,90 €. Questo sito è un prototipo: non è ancora possibile ordinare." },
    ],
  },
  {
    title: "La foto",
    items: [
      { q: "Che foto devo usare?", a: "Una foto nitida, con buona luce, dove si vedono bene viso, capelli e vestiti. Se vuoi una posa particolare, puoi aggiungere una seconda foto di riferimento." },
      { q: "Posso includere più persone o un animale?", a: "Sì: coppie, amici e animali domestici sono tra le richieste più amate. Ogni soggetto viene reinterpretato nello stesso stile cartoon." },
      { q: "La statuetta viene generata automaticamente dalla foto?", a: "No. Nel progetto MiniMe ogni personaggio viene reinterpretato a mano. Le animazioni di questo sito sono dimostrative." },
    ],
  },
  {
    title: "Pittura e regalo",
    items: [
      { q: "Devo saper dipingere?", a: "Per niente. La guida indica quale colore usare in ogni zona e i volumi scolpiti aiutano il pennello. Bastano un paio d'ore e un po' di pazienza." },
      { q: "Posso riceverla già colorata?", a: "Nel prototipo mostriamo solo il kit da dipingere; l'opzione già dipinta è allo studio." },
      { q: "È adatta come regalo?", a: "È pensata proprio per questo: arriva in una scatola regalo, e dipingerla insieme è parte del regalo." },
    ],
  },
];

export function FaqPage() {
  return (
    <main className="px-4 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow className="text-violet-deep">FAQ</Eyebrow>
          <RevealText as="h1" text={"Domande,\nrisposte."} className="text-display mt-4 text-[16vw] lg:text-[7vw]" />
          <FadeIn delay={0.3}>
            <p className="mt-5 max-w-sm text-lg text-ink-soft">Tutto quello che ci chiedono più spesso, in breve.</p>
            <div className="relative mt-8 h-[300px] w-full max-w-[360px] overflow-hidden rounded-[32px] bg-[radial-gradient(70%_70%_at_50%_45%,#ffffff_0%,#fbf1d6_60%,#ffe29a_120%)]">
              <Stage camera={{ position: [0, 1.4, 6], fov: 30 }} dpr={1} fallback={null}>
                <FaqFigure />
              </Stage>
            </div>
          </FadeIn>
        </div>

        <div className="space-y-12">
          {GROUPS.map((g) => (
            <section key={g.title} aria-labelledby={`faq-${g.title}`}>
              <h2 id={`faq-${g.title}`} className="text-eyebrow mb-4 text-ink/45">
                {g.title}
              </h2>
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {g.items.map((it) => (
                  <Item key={it.q} {...it} />
                ))}
              </div>
            </section>
          ))}
          <div className="flex flex-wrap items-center gap-4 rounded-[28px] bg-white p-6 ring-1 ring-ink/5">
            <p className="flex-1 text-lg font-semibold">Hai ancora un dubbio? Prova il configuratore.</p>
            <Button href="/crea">Crea la tua MiniMe</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h3>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
          <span className="text-xl font-bold tracking-tight transition-colors group-hover:text-violet-deep md:text-2xl">{q}</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0, backgroundColor: open ? "#a58bfa" : "#ffffff" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-ink/10"
          >
            <Plus className={`size-4 ${open ? "text-white" : ""}`} strokeWidth={2.5} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-ink-soft">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
