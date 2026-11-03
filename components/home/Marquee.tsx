"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["Coppie", "Lauree", "Amici", "Animali", "Compleanni", "Nonni", "Anniversari", "Matrimoni"];

/** Scroll-velocity marquee: a quiet editorial transition between hero and story. */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let boost = 0;
    const st = ScrollTrigger.create({
      onUpdate: (s) => {
        boost = Math.min(12, Math.abs(s.getVelocity()) / 300);
      },
    });
    const tick = (_t: number, dt: number) => {
      boost *= 0.94;
      x -= (0.04 + boost * 0.05) * dt;
      const w = el.scrollWidth / 2;
      if (-x > w) x += w;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);

  const row = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden border-y border-ink/10 bg-ink py-5 text-cream" aria-hidden>
      <div ref={track} className="flex w-max gap-10 whitespace-nowrap will-change-transform">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 text-3xl font-extrabold tracking-tight md:text-5xl">
            {w}
            <span className={`inline-block size-3 rounded-full ${i % 3 === 0 ? "bg-violet" : i % 3 === 1 ? "bg-butter" : "bg-blush"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
