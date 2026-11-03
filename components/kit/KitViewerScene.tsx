"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Brush, PaintJar, Pedestal } from "@/components/three/props/Props";
import { damp } from "@/lib/math";

const RING = ["#a58bfa", "#ffe29a", "#f9b8cb", "#1f1f22", "#bfd2ec", "#e6b48f"];

const HOTSPOTS: { pos: [number, number, number]; title: string; text: string }[] = [
  { pos: [0.25, 2.0, 0.25], title: "Capelli scolpiti", text: "Ogni riccio è modellato: il pennello trova da solo i volumi." },
  { pos: [0.18, 1.45, 0.42], title: "Viso essenziale", text: "Occhi lucidi e lineamenti morbidi, facili da rifinire." },
  { pos: [-0.2, 0.85, 0.25], title: "Vestiti fedeli", text: "Pieghe e dettagli ripresi dalla tua foto." },
  { pos: [0.15, 0.1, 0.3], title: "Base stabile", text: "Circa 15 cm, ben bilanciata per stare su qualsiasi mensola." },
];

/** 360° product viewer: orbit, moderate zoom, white/painted toggle, kit components. */
export default function KitViewerScene({ painted, showKit, showHotspots }: { painted: boolean; showKit: boolean; showHotspots: boolean }) {
  const fig = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const pop = useRef(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    pop.current = 1; // little bounce when the finish changes
  }, [painted]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    pop.current = damp(pop.current, 0, 5, dt);
    if (fig.current) {
      const s = 1 + Math.sin(pop.current * Math.PI) * 0.06;
      fig.current.scale.set(s, 1 + (s - 1) * -0.8, s);
      fig.current.position.y = Math.sin(t * 1.2) * 0.02;
    }
    if (ring.current) {
      const target = showKit ? 1 : 0.0001;
      const k = damp(ring.current.scale.x, target, 6, dt);
      ring.current.scale.setScalar(k);
      ring.current.visible = k > 0.01;
      ring.current.rotation.y = t * 0.25;
    }
  });

  return (
    <>
      <OrbitControls
        makeDefault
        target={[0, 1.0, 0]}
        enablePan={false}
        minDistance={3.4}
        maxDistance={7.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.62}
        autoRotate={!showHotspots}
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
      />
      <Pedestal radius={0.95} accent={painted ? "#a58bfa" : "#ffe29a"} />
      <group ref={fig}>
        <Figurine config={PRESETS.hero} painted={painted} follow={0.4} />
      </group>

      {showHotspots &&
        HOTSPOTS.map((h, i) => (
          <Html key={h.title} position={h.pos} center zIndexRange={[20, 0]}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setActive(active === i ? null : i)}
                className="grid size-7 place-items-center rounded-full bg-white text-[11px] font-bold text-ink shadow-lg ring-2 ring-violet transition-transform hover:scale-110"
                aria-label={h.title}
                aria-expanded={active === i}
              >
                {i + 1}
              </button>
              {active === i && (
                <div className="absolute left-9 top-1/2 w-52 -translate-y-1/2 rounded-2xl bg-white p-3 text-left shadow-xl ring-1 ring-ink/5">
                  <p className="text-[13px] font-bold">{h.title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-ink-soft">{h.text}</p>
                </div>
              )}
            </div>
          </Html>
        ))}

      <group ref={ring} position={[0, 0.9, 0]}>
        {RING.map((c, i) => {
          const a = (i / RING.length) * Math.PI * 2;
          return <PaintJar key={c} color={c} position={[Math.cos(a) * 1.75, -0.6 + (i % 2) * 0.15, Math.sin(a) * 1.75]} scale={0.8} />;
        })}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.5;
          return <Brush key={i} color={RING[i]} tip={RING[(i + 1) % 6]} position={[Math.cos(a) * 2.1, 0.6, Math.sin(a) * 2.1]} rotation={[0.3, -a, 0.5]} scale={0.8} />;
        })}
      </group>
      <ContactShadows position={[0, 0.002, 0]} scale={1.9} blur={2.2} far={2.4} opacity={0.5} resolution={512} color="#5b4a3a" />
    </>
  );
}
