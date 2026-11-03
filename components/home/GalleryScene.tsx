"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { Couple } from "@/components/three/figurine/Couple";
import { Pet } from "@/components/three/figurine/Pet";
import { PRESETS } from "@/components/three/figurine/types";
import { Pedestal } from "@/components/three/props/Props";
import { damp } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";
import { GALLERY_GAP, GALLERY_ITEMS } from "./galleryData";

function ItemModel({ k, small }: { k: string; small?: boolean }) {
  switch (k) {
    case "coppia":
      return <Couple lowDetail={small} />;
    case "laurea":
      return <Figurine config={PRESETS.graduate} lowDetail={small} />;
    case "amici":
      return (
        <>
          <Figurine config={PRESETS.friendA} position={[-0.42, 0, 0]} rotation={[0, 0.25, 0]} scale={0.9} lowDetail={small} />
          <Figurine config={PRESETS.friendB} position={[0.45, 0, -0.05]} rotation={[0, -0.25, 0]} scale={0.95} lowDetail={small} />
        </>
      );
    case "pet":
      return (
        <>
          <Figurine config={PRESETS.petOwner} position={[-0.3, 0, 0]} rotation={[0, 0.2, 0]} lowDetail={small} />
          <Pet position={[0.55, 0, 0.25]} rotation={[0, -0.4, 0]} />
        </>
      );
    default:
      return <Figurine config={PRESETS.birthday} lowDetail={small} />;
  }
}

/** A horizontal gallery the camera travels through as the page scrolls. */
export default function GalleryScene({
  progress,
  small,
  onActive,
}: {
  progress: ProgressRef;
  small?: boolean;
  onActive?: (i: number) => void;
}) {
  const p = useRef(0);
  const items = useRef<(THREE.Group | null)[]>([]);
  const spot = useRef<THREE.SpotLight>(null);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const [hovered, setHovered] = useState<number | null>(null);
  const lastActive = useRef(-1);
  const look = useRef(new THREE.Vector3());
  const span = (GALLERY_ITEMS.length - 1) * GALLERY_GAP;

  useEffect(() => {
    document.body.style.cursor = hovered !== null ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    p.current = damp(p.current, progress.current, 4.5, dt);
    const x = p.current * span;
    const portrait = state.size.width / state.size.height < 0.8;

    const cam = state.camera;
    cam.position.set(x + state.pointer.x * 0.3, 1.7 + state.pointer.y * 0.15, portrait ? 12.5 : 9.4);
    look.current.set(x, portrait ? 1.35 : 1.05, 0);
    cam.lookAt(look.current);

    // Item nearest to the camera is "active" when nothing is hovered (touch friendly).
    const nearest = Math.round(x / GALLERY_GAP);
    const active = hovered ?? nearest;
    if (active !== lastActive.current) {
      lastActive.current = active;
      onActive?.(active);
    }

    items.current.forEach((g, i) => {
      if (!g) return;
      const on = i === active;
      g.position.y = damp(g.position.y, on ? 0.28 : 0, 6, dt);
      const base = (i * GALLERY_GAP - x) * -0.12; // subtle parallax turn towards camera
      g.rotation.y = damp(g.rotation.y, base + (on ? Math.sin(t * 0.8) * 0.35 + 0.25 : 0), 4, dt);
      const s = on ? 1.04 : 0.94;
      g.scale.setScalar(damp(g.scale.x, s, 6, dt));
    });

    if (spot.current) {
      spot.current.position.x = damp(spot.current.position.x, active * GALLERY_GAP, 5, dt);
      spotTarget.position.set(spot.current.position.x, 0.8, 0);
      spot.current.target = spotTarget;
    }
  });

  return (
    <>
      <spotLight ref={spot} position={[0, 6, 3]} angle={0.42} penumbra={0.8} intensity={60} color="#fff3df" distance={14} decay={1.6} />
      <primitive object={spotTarget} />
      {GALLERY_ITEMS.map((it, i) => (
        <group key={it.key} position={[i * GALLERY_GAP, 0, 0]}>
          <Pedestal radius={1.05} accent={it.accent} position={[0, 0, 0]} />
          <group
            ref={(el) => void (items.current[i] = el)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={() => setHovered((h) => (h === i ? null : h))}
          >
            <ItemModel k={it.key} small={small} />
          </group>
        </group>
      ))}
      <ContactShadows position={[span / 2, 0.002, 0]} scale={[span + 2.4, 2.4]} blur={2.2} far={2.4} opacity={0.42} resolution={small ? 512 : 1024} />
    </>
  );
}
