"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Pedestal } from "@/components/three/props/Props";
import { useDragRotate } from "@/components/three/useDragRotate";
import { damp } from "@/lib/math";
import { geo } from "@/components/three/resources";

type Props = { onLanded?: () => void; reduced?: boolean; small?: boolean };

/**
 * Hero: the statuette drops onto its platform, squashes, turns to the viewer
 * and keeps floating — following the pointer, draggable, reactive on hover.
 */
export default function HeroScene({ onLanded, reduced = false, small = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const platform = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const drag = useDragRotate({ returnHome: true });
  const [waving, setWaving] = useState(false);
  const hop = useRef({ y: 0, v: 0 });
  const intro = useRef({ y: reduced ? 0 : 6.5, sy: 1, sxz: 1, turn: reduced ? 0 : -2.6, ripple: 0, landed: reduced, platformY: 0 });
  const rippleMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#a58bfa", transparent: true, opacity: 0, depthWrite: false }),
    []
  );

  // Camera framing responsive to aspect ratio.
  useEffect(() => {
    const portrait = size.width / size.height < 0.8;
    camera.position.set(0, portrait ? 1.6 : 1.45, portrait ? 12.5 : 8.6);
    camera.lookAt(0, portrait ? 0.55 : 0.95, 0);
  }, [camera, size]);

  useEffect(() => {
    if (reduced) {
      onLanded?.();
      return;
    }
    const s = intro.current;
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(s, { y: 0, duration: 1.0, ease: "power3.in" })
      .to(s, { sy: 1.1, sxz: 0.93, duration: 0.7, ease: "power2.in" }, 0.25)
      .addLabel("land")
      .call(() => {
        s.landed = true;
      })
      .to(s, { sy: 0.74, sxz: 1.2, duration: 0.11, ease: "power2.out" }, "land")
      .to(s, { platformY: -0.08, duration: 0.11, ease: "power2.out" }, "land")
      .to(s, { ripple: 1, duration: 1.1, ease: "power2.out" }, "land")
      .to(s, { sy: 1.08, sxz: 0.95, duration: 0.2, ease: "power2.out" }, "land+=0.11")
      .to(s, { platformY: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" }, "land+=0.11")
      .to(s, { sy: 1, sxz: 1, duration: 0.9, ease: "elastic.out(1, 0.32)" }, "land+=0.31")
      .to(s, { turn: 0, duration: 1.5, ease: "power3.out" }, "land+=0.15")
      .call(() => onLanded?.(), undefined, "land+=0.25");
    return () => {
      tl.kill();
    };
  }, [reduced, onLanded]);

  useEffect(() => () => rippleMat.dispose(), [rippleMat]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const s = intro.current;
    const g = group.current;
    const sq = squash.current;
    if (!g || !sq) return;

    // Hover hop: simple spring.
    const h = hop.current;
    h.v += (-h.y * 70 - h.v * 9) * dt;
    h.y += h.v * dt;

    const float = s.landed && !reduced ? (Math.sin(t * 1.25) * 0.5 + 0.5) * 0.12 : 0;
    g.position.y = s.y + float + Math.max(0, h.y);

    const angle = drag.update(dt);
    const followY = state.pointer.x * 0.4;
    const followX = -state.pointer.y * 0.05;
    g.rotation.y = damp(g.rotation.y, s.turn + angle + (s.landed ? followY : 0), 5, dt);
    g.rotation.x = damp(g.rotation.x, s.landed ? followX : 0, 4, dt);

    sq.scale.set(s.sxz, s.sy, s.sxz);
    if (platform.current) platform.current.position.y = s.platformY;

    if (ripple.current) {
      const r = s.ripple;
      ripple.current.scale.setScalar(0.8 + r * 1.9);
      rippleMat.opacity = r > 0 && r < 1 ? (1 - r) * 0.55 : 0;
    }

    // Key light drifts with the pointer → shading and highlights respond.
    if (keyLight.current) {
      keyLight.current.position.x = damp(keyLight.current.position.x, 3 + state.pointer.x * 4, 2, dt);
      keyLight.current.position.y = damp(keyLight.current.position.y, 5 + state.pointer.y * 2, 2, dt);
    }
  });

  const react = () => {
    if (!intro.current.landed) return;
    hop.current.v = 2.4;
    setWaving(true);
    window.setTimeout(() => setWaving(false), 1600);
  };

  return (
    <>
      <directionalLight ref={keyLight} position={[3, 5, 4]} intensity={0.9} color="#fff1df" />
      <group ref={platform}>
        <Pedestal radius={0.95} position={[0, 0, 0]} />
        <mesh ref={ripple} geometry={geo.torus(0.7, 0.012)} material={rippleMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
      </group>
      <group ref={group} onPointerOver={react}>
        <group ref={squash}>
          <Figurine config={PRESETS.hero} follow={1} waving={waving} lowDetail={small} />
        </group>
      </group>
      <ContactShadows position={[0, 0.002, 0]} scale={1.9} blur={2.2} far={2.4} opacity={0.6} resolution={small ? 256 : 512} color="#5b4a3a" />
    </>
  );
}
