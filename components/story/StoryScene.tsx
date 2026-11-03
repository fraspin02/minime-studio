"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Brush, GiftBoxBase, GiftBoxLid, PaintJar, PhotoCard } from "@/components/three/props/Props";
import { geo, RAW_RESIN } from "@/components/three/resources";
import { clamp, damp, lerp, smooth } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";

export const CHAPTERS = 6;
type Mode = "painted" | "wire" | "print" | "raw";
const MODES: Mode[] = ["painted", "wire", "print", "raw", "painted", "painted"];

/** Per-chapter pose of the guide statuette + camera. */
const KEYS = [
  { x: 0.9, y: 0, ry: -0.5, s: 0.9, cz: 7.2, cy: 1.4 },
  { x: 0, y: 0.15, ry: 0.8, s: 1, cz: 6.6, cy: 1.5 },
  { x: 0, y: 0, ry: 0, s: 1, cz: 7.0, cy: 1.9 },
  { x: 0, y: 0, ry: 0.3, s: 1.15, cz: 4.8, cy: 1.7 },
  { x: -0.2, y: 0, ry: -0.25, s: 1, cz: 5.8, cy: 1.5 },
  { x: -0.8, y: 0.05, ry: 0.45, s: 0.85, cz: 7.4, cy: 1.6 },
];

const JARS = ["#a58bfa", "#ffe29a", "#f9b8cb", "#1f1f22", "#bfd2ec"];

export default function StoryScene({ progress }: { progress: ProgressRef }) {
  const p = useRef(0);
  const fig = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Group>(null);
  const grid = useRef<THREE.Group>(null);
  const printer = useRef<THREE.Group>(null);
  const sparkles = useRef<THREE.Group>(null);
  const paint = useRef<THREE.Group>(null);
  const gift = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const look = useRef(new THREE.Vector3());
  const [mode, setMode] = useState<Mode>("painted");
  const modeRef = useRef<Mode>("painted");

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 10), []);
  const mats = useMemo(
    () => ({
      wire: new THREE.MeshBasicMaterial({ color: "#a58bfa", wireframe: true, transparent: true, opacity: 0.75 }),
      print: new THREE.MeshStandardMaterial({ color: RAW_RESIN, roughness: 0.6, side: THREE.DoubleSide, clippingPlanes: [clip] }),
      glow: new THREE.MeshBasicMaterial({ color: "#a58bfa", toneMapped: false }),
      star: new THREE.MeshBasicMaterial({ color: "#ffe29a", toneMapped: false }),
    }),
    [clip]
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    p.current = damp(p.current, progress.current, 5, dt);
    const c = p.current * (CHAPTERS - 1); // continuous chapter position
    const i0 = Math.floor(clamp(c, 0, CHAPTERS - 1));
    const i1 = Math.min(CHAPTERS - 1, i0 + 1);
    const f = smooth(clamp((c - i0 - 0.35) / 0.3)); // hold, then transition in the middle
    const a = KEYS[i0];
    const b = KEYS[i1];
    const k = {
      x: lerp(a.x, b.x, f),
      y: lerp(a.y, b.y, f),
      ry: lerp(a.ry, b.ry, f),
      s: lerp(a.s, b.s, f),
      cz: lerp(a.cz, b.cz, f),
      cy: lerp(a.cy, b.cy, f),
    };
    const nearest = Math.round(c);
    const m = MODES[nearest];
    if (m !== modeRef.current) {
      modeRef.current = m;
      setMode(m);
    }

    // Guide statuette
    if (fig.current) {
      const spin = Math.sin(f * Math.PI) * Math.PI; // spins through each transition, hiding the material swap
      fig.current.position.set(k.x, k.y + Math.sin(t * 1.2) * 0.04, 0);
      fig.current.rotation.y = k.ry + spin + Math.sin(t * 0.5) * 0.08;
      fig.current.scale.setScalar(k.s);
    }

    const cam = state.camera;
    cam.position.set(Math.sin(t * 0.2) * 0.2, k.cy, k.cz);
    look.current.set(0, 1.05, 0);
    cam.lookAt(look.current);

    // Chapter props fade in/out by proximity
    const w = (i: number) => smooth(clamp(1 - Math.abs(c - i) * 1.6));
    const show = (g: THREE.Object3D | null, i: number) => {
      if (!g) return;
      const v = w(i);
      g.scale.setScalar(Math.max(0.0001, v));
      g.visible = v > 0.01;
    };
    show(photo.current, 0);
    show(grid.current, 1);
    show(printer.current, 2);
    show(sparkles.current, 3);
    show(paint.current, 4);
    show(gift.current, 5);

    if (photo.current) photo.current.rotation.y = -0.5 + Math.sin(t * 0.7) * 0.1;
    if (grid.current) grid.current.rotation.y = t * 0.2;
    if (sparkles.current) sparkles.current.rotation.y = t * 0.6;
    if (paint.current) paint.current.rotation.y = t * 0.4;

    // Printing: layer height follows local chapter progress
    const local = clamp(c - 1.6, 0, 1);
    clip.constant = m === "print" ? 0.05 + local * 2.3 : 10;
    if (ring.current) {
      ring.current.position.y = clip.constant;
      ring.current.visible = m === "print" && local < 0.98;
    }
  });

  const override = mode === "wire" ? mats.wire : mode === "print" ? mats.print : undefined;

  return (
    <>
      <group ref={fig}>
        <Figurine config={PRESETS.hero} painted={mode !== "raw"} overrideMaterial={override} follow={0.4} waving={mode === "painted"} />
        <mesh ref={ring} geometry={geo.torus(0.55, 0.012)} material={mats.glow} rotation={[-Math.PI / 2, 0, 0]} />
      </group>

      {/* 01 photo */}
      <group ref={photo} position={[-1.3, 1.3, -0.4]}>
        <Float speed={1.4} floatIntensity={0.6}>
          <PhotoCard theme="couple" scale={0.75} />
        </Float>
      </group>

      {/* 02 digital sculpt grid */}
      <group ref={grid}>
        <gridHelper args={[5, 20, "#a58bfa", "#d9cdfd"]} position={[0, 0.001, 0]} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={geo.torus(1.2 + i * 0.35, 0.006)} material={mats.glow} rotation={[Math.PI / 2 + i * 0.3, i * 0.6, 0]} position={[0, 1.1, 0]} />
        ))}
      </group>

      {/* 03 printer bed */}
      <group ref={printer}>
        <mesh geometry={geo.box(2.4, 0.08, 2.4)} material={mats.print} position={[0, -0.04, 0]} />
        {[-1.15, 1.15].map((x) => (
          <mesh key={x} geometry={geo.box(0.08, 3.2, 0.08)} material={mats.glow} position={[x, 1.6, -1.15]} />
        ))}
        <mesh geometry={geo.box(2.38, 0.08, 0.08)} material={mats.glow} position={[0, 3.2, -1.15]} />
      </group>

      {/* 04 finishing sparkles */}
      <group ref={sparkles} position={[0, 1.2, 0]}>
        {Array.from({ length: 10 }).map((_, i) => {
          const ang = (i / 10) * Math.PI * 2;
          return <mesh key={i} geometry={geo.sphere(12)} material={mats.star} position={[Math.cos(ang) * 1.1, Math.sin(i * 1.7) * 0.8, Math.sin(ang) * 1.1]} scale={0.035 + (i % 3) * 0.015} />;
        })}
      </group>

      {/* 05 paint */}
      <group ref={paint} position={[0, 1.0, 0]}>
        {JARS.map((col, i) => {
          const ang = (i / JARS.length) * Math.PI * 2;
          return <PaintJar key={col} color={col} position={[Math.cos(ang) * 1.5, -0.7 + (i % 2) * 0.3, Math.sin(ang) * 1.5]} scale={0.8} />;
        })}
        {[0, 1, 2].map((i) => {
          const ang = (i / 3) * Math.PI * 2 + 0.6;
          return <Brush key={i} color={JARS[i]} tip={JARS[(i + 2) % 5]} position={[Math.cos(ang) * 1.8, 0.5, Math.sin(ang) * 1.8]} rotation={[0.4, -ang, 0.6]} scale={0.75} />;
        })}
      </group>

      {/* 06 gift */}
      <group ref={gift} position={[1.25, 0, -0.3]}>
        <group scale={0.62} rotation={[0, -0.5, 0]}>
          <GiftBoxBase />
          <GiftBoxLid position={[0.2, 1.5, 0.2]} rotation={[0.3, 0.2, 0.25]} />
        </group>
      </group>

      <ContactShadows position={[0, 0.002, 0]} scale={6} blur={2.4} far={3} opacity={0.4} resolution={512} />
    </>
  );
}
