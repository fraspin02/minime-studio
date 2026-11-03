"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Brush, GiftBoxBase, GiftBoxLid, PaintJar } from "@/components/three/props/Props";
import { useDragRotate } from "@/components/three/useDragRotate";
import { damp, easeOutBack, lerp, range, smooth } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";

const BRUSHES = [
  { to: [1.55, 1.9, 0.2], rot: [0.2, 0, -0.5], color: "#a58bfa", tip: "#ffe29a" },
  { to: [1.95, 1.4, -0.2], rot: [0.1, 0.4, -0.9], color: "#ffe29a", tip: "#f9b8cb" },
  { to: [1.25, 1.15, 0.6], rot: [0.5, 0.2, -0.25], color: "#f9b8cb", tip: "#a58bfa" },
] as const;

const JARS = ["#a58bfa", "#ffe29a", "#f9b8cb", "#1f1f22", "#bfd2ec", "#e6b48f"];

/**
 * The gift box opens: lid lifts, the white statuette rises, brushes slide out
 * and paint jars line up. Driven by `progress` (scroll) — or auto-plays when `autoplay`.
 */
export default function KitUnboxing({
  progress,
  autoplay = false,
  small,
  framing = "side",
}: {
  progress?: ProgressRef;
  autoplay?: boolean;
  small?: boolean;
  framing?: "side" | "center";
}) {
  const p = useRef(0);
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const fig = useRef<THREE.Group>(null);
  const brushes = useRef<(THREE.Group | null)[]>([]);
  const jars = useRef<(THREE.Group | null)[]>([]);
  const drag = useDragRotate({ returnHome: false });
  const look = useRef(new THREE.Vector3());
  const auto = useRef(0);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    if (autoplay) {
      auto.current = Math.min(1, auto.current + dt / 6);
    }
    const target = autoplay ? auto.current : progress?.current ?? 1;
    p.current = damp(p.current, target, 5, dt);
    const v = p.current;
    const portrait = state.size.width / state.size.height < 0.8;

    // Camera
    const cam = state.camera;
    const pull = smooth(range(v, 0.7, 1));
    const sideX = framing === "side" && !portrait ? -1.6 : 0;
    const dist = (portrait ? 11.5 : framing === "center" ? 9.4 : 8.4) + pull * 0.6;
    cam.position.set(sideX + Math.sin(t * 0.2) * 0.2, 2.7 + pull * 0.2, dist);
    look.current.set(sideX * 0.85, framing === "center" ? 1.85 : 1.25, 0);
    cam.lookAt(look.current);

    // Whole composition: slow turn + drag
    if (root.current) {
      const spin = lerp(-0.7, 0.35, smooth(range(v, 0, 0.25)));
      root.current.rotation.y = damp(root.current.rotation.y, spin + drag.update(dt) + Math.sin(t * 0.3) * 0.06, 6, dt);
    }

    // Lid
    const open = smooth(range(v, 0.14, 0.34));
    if (lid.current) {
      lid.current.position.set(lerp(0, -0.9, open), lerp(1.02, 3.0, open) + Math.sin(t * 1.4) * 0.05 * open, lerp(0, -1.6, open));
      lid.current.rotation.set(lerp(0, 0.55, open), lerp(0, 0.4, open), lerp(0, 0.35, open));
      lid.current.scale.setScalar(lerp(1, 0.85, open));
    }

    // Statuette rises out of the box
    const rise = range(v, 0.3, 0.56);
    if (fig.current) {
      const e = smooth(rise);
      fig.current.position.y = lerp(-0.9, 1.25, e) + Math.sin(t * 1.2) * 0.05 * e;
      fig.current.rotation.y = (1 - e) * Math.PI * 2;
      fig.current.visible = rise > 0;
    }

    // Brushes slide out and fan
    BRUSHES.forEach((b, i) => {
      const g = brushes.current[i];
      if (!g) return;
      const k = range(v, 0.5 + i * 0.05, 0.68 + i * 0.05);
      const e = easeOutBack(k, 1.2);
      g.visible = k > 0;
      g.position.set(lerp(0.3, b.to[0], e), lerp(0.6, b.to[1], e) + Math.sin(t * 1.6 + i) * 0.05 * k, lerp(0, b.to[2], e));
      g.rotation.set(lerp(0, b.rot[0], e), lerp(0, b.rot[1], e) + Math.sin(t + i) * 0.1 * k, lerp(0, b.rot[2], e));
    });

    // Jars hop out and line up in front
    JARS.forEach((_, i) => {
      const g = jars.current[i];
      if (!g) return;
      const k = range(v, 0.62 + i * 0.035, 0.76 + i * 0.035);
      const e = smooth(k);
      g.visible = k > 0;
      const tx = (i - (JARS.length - 1) / 2) * 0.48;
      g.position.set(lerp(0, tx, e), lerp(0.6, 0, e) + Math.sin(e * Math.PI) * 0.9, lerp(0, 1.45, e));
      g.scale.setScalar(lerp(0.5, 1, e));
    });
  });

  return (
    <>
      <group ref={root}>
        <GiftBoxBase />
        <GiftBoxLid ref={lid} position={[0, 1.02, 0]} />
        <group ref={fig} visible={false}>
          <Figurine config={PRESETS.hero} painted={false} scale={0.72} lowDetail={small} />
        </group>
        {BRUSHES.map((b, i) => (
          <group key={i} ref={(el) => void (brushes.current[i] = el)} visible={false}>
            <Brush color={b.color} tip={b.tip} length={1.0} />
          </group>
        ))}
        {JARS.map((c, i) => (
          <group key={c} ref={(el) => void (jars.current[i] = el)} visible={false}>
            <PaintJar color={c} />
          </group>
        ))}
      </group>
      <ContactShadows position={[0, 0.001, 0]} scale={7} blur={2.6} far={3.5} opacity={0.35} resolution={small ? 256 : 512} color="#4b3c7a" />
    </>
  );
}
