"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import { PRESETS } from "@/components/three/figurine/types";
import { Pedestal } from "@/components/three/props/Props";

/** Small decorative statuette — light scene, no controls. */
export default function FaqFigure() {
  const g = useRef<THREE.Group>(null);
  const [wave, setWave] = useState(false);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.lookAt(0, 1.0, 0);
    if (!g.current) return;
    g.current.rotation.y = Math.sin(t * 0.5) * 0.35 + state.pointer.x * 0.3;
    g.current.position.y = Math.sin(t * 1.3) * 0.04;
  });
  return (
    <>
      <Pedestal radius={0.9} accent="#a58bfa" />
      <group ref={g} onPointerOver={() => setWave(true)} onPointerOut={() => setWave(false)}>
        <Figurine config={{ ...PRESETS.friendB, pose: "hips" }} follow={0.6} waving={wave} lowDetail />
      </group>
      <ContactShadows position={[0, 0.002, 0]} scale={1.8} blur={2} far={2.2} opacity={0.45} resolution={256} />
    </>
  );
}
