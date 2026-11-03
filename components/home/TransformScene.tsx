"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Couple } from "@/components/three/figurine/Couple";
import { Pedestal, PhotoCard, setPhotoOpacity } from "@/components/three/props/Props";
import { PhotoParticles } from "@/components/three/PhotoParticles";
import { damp, easeOutBack, range, smooth } from "@/lib/math";
import type { ProgressRef } from "@/lib/useScrollProgress";

const CARD_POS: [number, number, number] = [0, 1.25, 0.3];

/**
 * Photo → statuette. Scroll drives: photo appears, lifts, dissolves into particles,
 * the statuette assembles and the camera orbits around it.
 */
export default function TransformScene({ progress, small }: { progress: ProgressRef; small?: boolean }) {
  const p = useRef(0);
  const particleP = useRef(0);
  const card = useRef<THREE.Group>(null);
  const couple = useRef<THREE.Group>(null);
  const pedestal = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(0, 1.1, 0));

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    p.current = damp(p.current, progress.current, 6, dt);
    const v = p.current;
    const t = state.clock.elapsedTime;
    const portrait = state.size.width / state.size.height < 0.8;

    // --- Photo card
    const appear = smooth(range(v, 0.0, 0.14));
    const lift = smooth(range(v, 0.14, 0.36));
    const dissolve = range(v, 0.34, 0.5);
    if (card.current) {
      const c = card.current;
      c.position.set(CARD_POS[0], CARD_POS[1] - 1.2 * (1 - appear) + lift * 0.2 + Math.sin(t * 1.2) * 0.03, CARD_POS[2] + lift * 0.3);
      c.rotation.set(-0.35 * (1 - appear) - lift * 0.18, Math.sin(t * 0.6) * 0.08 + lift * 0.25, -0.06 + lift * 0.1);
      const s = (0.82 + appear * 0.08) * (1 + dissolve * 0.12);
      c.scale.setScalar(s);
      setPhotoOpacity(c, appear * (1 - smooth(dissolve)));
    }

    // --- Particles bridge the swap
    particleP.current = range(v, 0.32, 0.72);

    // --- Statuette assembles
    const build = range(v, 0.48, 0.68);
    if (couple.current) {
      const k = build <= 0 ? 0 : easeOutBack(build, 1.3);
      couple.current.scale.setScalar(Math.max(0.0001, k));
      couple.current.visible = build > 0;
      couple.current.rotation.y = -1.6 * (1 - smooth(build)) + Math.sin(t * 0.5) * 0.05;
      couple.current.position.y = Math.sin(t * 1.1) * 0.03;
    }
    if (pedestal.current) {
      const k = smooth(range(v, 0.42, 0.6));
      pedestal.current.scale.set(k, 1, k);
      pedestal.current.visible = k > 0.01;
    }

    // --- Camera: dolly in, then orbit
    const orbit = smooth(range(v, 0.6, 1)) * 1.25;
    const dist = (portrait ? 10.6 : 8.6) - smooth(range(v, 0, 0.3)) * 0.8 - smooth(range(v, 0.75, 1)) * 0.5;
    const yaw = -0.35 + orbit;
    const cam = state.camera;
    // shift the subject to the right of the frame on wide screens (copy lives on the left)
    const shift = portrait ? 0 : -1.25;
    const rx = Math.cos(yaw) * shift;
    const rz = -Math.sin(yaw) * shift;
    cam.position.set(Math.sin(yaw) * dist + rx, 1.5 + orbit * 0.35, Math.cos(yaw) * dist + rz);
    target.current.set(rx, (portrait ? 0.95 : 1.1) + lift * 0.1, rz);
    cam.lookAt(target.current);
  });

  return (
    <>
      <PhotoCard ref={card} theme="couple" />

      <PhotoParticles
        progress={particleP}
        count={small ? 900 : 1800}
        from={{ center: [CARD_POS[0], CARD_POS[1] + 0.2, CARD_POS[2] + 0.3], size: [1.3, 1.5] }}
        to={[
          { center: [-0.26, 1.5, 0.06], radius: [0.42, 0.42, 0.42] },
          { center: [0.28, 1.6, -0.04], radius: [0.5, 0.48, 0.48] },
          { center: [0, 0.6, 0], radius: [0.55, 0.6, 0.3] },
        ]}
      />

      <group ref={couple} visible={false}>
        <Couple lowDetail={small} />
      </group>

      <group ref={pedestal}>
        <Pedestal radius={0.95} accent="#ffe29a" />
      </group>
      <ContactShadows position={[0, 0.002, 0]} scale={1.9} blur={2.2} far={2.2} opacity={0.5} resolution={small ? 256 : 512} color="#5b4a3a" />
    </>
  );
}
