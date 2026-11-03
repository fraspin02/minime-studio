"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Brush, PaintJar, Pedestal, PhotoCard, type PhotoTheme } from "@/components/three/props/Props";
import { geo, RAW_RESIN } from "@/components/three/resources";
import { damp, range, smooth } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";

export const STATION_GAP = 7.5;

const PHOTOS: { theme: PhotoTheme; pos: [number, number, number]; rot: [number, number, number] }[] = [
  { theme: "couple", pos: [-1.5, 1.7, 0.2], rot: [0.05, 0.35, -0.12] },
  { theme: "friends", pos: [1.45, 2.05, -0.4], rot: [-0.05, -0.3, 0.1] },
  { theme: "pet", pos: [-0.25, 0.7, 0.9], rot: [-0.2, 0.1, 0.06] },
  { theme: "grad", pos: [1.25, 0.45, 0.5], rot: [0.1, -0.4, -0.08] },
  { theme: "party", pos: [-1.35, 0.35, -0.6], rot: [0.12, 0.5, 0.14] },
];

const JAR_COLORS = ["#a58bfa", "#ffe29a", "#f9b8cb", "#1f1f22", "#bfd2ec", "#e6b48f"];

/** Three steps in the same 3D space; the camera glides from one station to the next. */
export default function StepsScene({ progress, small }: { progress: ProgressRef; small?: boolean }) {
  const p = useRef(0);
  const photos = useRef<THREE.Group>(null);
  const printFig = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const nozzle = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const painted = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3());

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const printMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: RAW_RESIN,
        roughness: 0.6,
        side: THREE.DoubleSide,
        clippingPlanes: [clip],
      }),
    [clip]
  );
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#a58bfa", toneMapped: false }), []);
  useEffect(
    () => () => {
      printMat.dispose();
      glowMat.dispose();
    },
    [printMat, glowMat]
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    p.current = damp(p.current, progress.current, 5, dt);
    const v = p.current;
    const t = state.clock.elapsedTime;
    const portrait = state.size.width / state.size.height < 0.8;

    // Station travel: hold → glide → hold → glide → hold
    const a = smooth(range(v, 0.24, 0.4));
    const b = smooth(range(v, 0.6, 0.76));
    const x = (a + b) * STATION_GAP;
    const swoop = Math.sin(a * Math.PI) + Math.sin(b * Math.PI); // camera rises mid-travel
    const dist = portrait ? 10.5 : 7.4;
    const cam = state.camera;
    const sideways = portrait ? 0 : -0.9; // leave room for the copy on the left
    cam.position.set(x + sideways + Math.sin(t * 0.25) * 0.15, 1.6 + swoop * 0.9, dist - swoop * 0.6);
    look.current.set(x + sideways, 1.05 + swoop * 0.2, 0);
    cam.lookAt(look.current);

    // Station 1 — photos drift
    if (photos.current) photos.current.rotation.y = Math.sin(t * 0.2) * 0.15 + v * 0.8;

    // Station 2 — the statuette is "printed" layer by layer
    const print = range(v, 0.3, 0.56);
    const h = print * 2.25;
    clip.constant = h;
    if (printFig.current) printFig.current.rotation.y = t * 0.35;
    if (ring.current) {
      ring.current.position.y = h;
      const r = 0.25 + 0.35 * Math.sin(Math.min(1, print * 1.15) * Math.PI);
      ring.current.scale.setScalar(print > 0 && print < 1 ? r : 0.0001);
    }
    if (nozzle.current) {
      nozzle.current.position.set(STATION_GAP + Math.cos(t * 4) * 0.35, h + 0.55, Math.sin(t * 4) * 0.35);
      nozzle.current.visible = print > 0 && print < 1;
    }

    // Station 3 — brushes & jars orbit the painted statuette
    if (orbit.current) {
      orbit.current.rotation.y = t * 0.45;
      const open = smooth(range(v, 0.66, 0.86));
      orbit.current.scale.setScalar(0.5 + open * 0.5);
    }
    if (painted.current) painted.current.rotation.y = Math.sin(t * 0.6) * 0.3;
  });

  return (
    <>
      {/* -------- 01 · Photos -------- */}
      <group ref={photos} position={[0, 0, 0]}>
        {PHOTOS.map((ph, i) => (
          <Float key={ph.theme} speed={1.2 + i * 0.15} rotationIntensity={0.35} floatIntensity={0.5}>
            <PhotoCard theme={ph.theme} position={ph.pos} rotation={ph.rot} scale={0.52} />
          </Float>
        ))}
      </group>

      {/* -------- 02 · Print -------- */}
      <group position={[STATION_GAP, 0, 0]}>
        <Pedestal radius={1.0} accent="#a58bfa" />
        <group ref={printFig}>
          <Figurine config={PRESETS.friendB} overrideMaterial={printMat} lowDetail={small} />
        </group>
        <mesh ref={ring} geometry={geo.torus(1, 0.012)} material={glowMat} rotation={[-Math.PI / 2, 0, 0]} />
        <ContactShadows position={[0, 0.002, 0]} scale={2} blur={2.4} far={2} opacity={0.35} resolution={256} />
      </group>
      <group ref={nozzle}>
        <mesh geometry={geo.cone(0.06, 0.16)} material={glowMat} rotation={[Math.PI, 0, 0]} />
        <mesh geometry={geo.cylinder(0.05, 0.05, 0.5, 16)} material={printMat} position={[0, 0.32, 0]} />
      </group>

      {/* -------- 03 · Paint -------- */}
      <group position={[STATION_GAP * 2, 0, 0]}>
        <Pedestal radius={1.0} accent="#ffe29a" />
        <group ref={painted}>
          <Figurine config={PRESETS.friendA} lowDetail={small} />
        </group>
        <group ref={orbit} position={[0, 1.1, 0]}>
          {[0, 1, 2, 3].map((i) => {
            const ang = (i / 4) * Math.PI * 2;
            return (
              <Float key={`b${i}`} speed={2} rotationIntensity={1} floatIntensity={0.6}>
                <Brush position={[Math.cos(ang) * 1.95, 0.3 + (i % 2) * 0.5, Math.sin(ang) * 1.95]} rotation={[0.4, ang, 0.7 + i * 0.2]} color={JAR_COLORS[i]} tip={JAR_COLORS[(i + 2) % 6]} scale={0.8} />
              </Float>
            );
          })}
          {JAR_COLORS.map((c, i) => {
            const ang = (i / JAR_COLORS.length) * Math.PI * 2 + 0.4;
            return (
              <Float key={`j${i}`} speed={1.6} rotationIntensity={0.6} floatIntensity={0.8}>
                <PaintJar color={c} position={[Math.cos(ang) * 1.7, -0.75 + (i % 3) * 0.2, Math.sin(ang) * 1.7]} rotation={[0.2, 0, 0.15]} scale={0.85} />
              </Float>
            );
          })}
        </group>
        <ContactShadows position={[0, 0.002, 0]} scale={2} blur={2.4} far={2} opacity={0.4} resolution={256} />
      </group>
    </>
  );
}
