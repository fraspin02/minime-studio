"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { damp, range, smooth } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";

/** A giant statuette spins into frame and keeps floating. */
export default function FinalCtaScene({ progress, small }: { progress: ProgressRef; small?: boolean }) {
  const g = useRef<THREE.Group>(null);
  const p = useRef(0);
  const [waving, setWaving] = useState(false);
  const look = useRef(new THREE.Vector3());

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    p.current = damp(p.current, progress.current, 4, dt);
    const enter = smooth(range(p.current, 0, 0.85));
    const portrait = state.size.width / state.size.height < 0.8;
    const cam = state.camera;
    cam.position.set(0, 1.5, portrait ? 8.5 : 6.2);
    look.current.set(0, portrait ? 0.9 : 1.2, 0);
    cam.lookAt(look.current);

    if (!g.current) return;
    const restX = portrait ? 0 : 1.75;
    g.current.position.x = restX + (1 - enter) * 4.5;
    g.current.position.y = -0.15 + (portrait ? -0.9 : 0) + Math.sin(t * 1.1) * 0.08 - (1 - enter) * 0.6;
    g.current.rotation.y = (1 - enter) * Math.PI * 2.4 - 0.35 + state.pointer.x * 0.35;
    g.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    const s = (portrait ? 1.0 : 1.15) * (0.6 + enter * 0.4);
    g.current.scale.setScalar(s);
  });

  return (
    <group ref={g} onPointerOver={() => setWaving(true)} onPointerOut={() => setWaving(false)}>
      <Figurine config={{ ...PRESETS.hero, accessory: "none" }} follow={0.8} waving={waving} lowDetail={small} />
    </group>
  );
}
