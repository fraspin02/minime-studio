"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Figurine } from "@/components/three/figurine/Figurine";
import type { FigureConfig } from "@/components/three/figurine/types";
import { Pedestal } from "@/components/three/props/Props";
import { damp } from "@/lib/math";

/** Live preview: every option change re-builds the statuette with a small squash "pop". */
export default function ConfiguratorScene({ config, painted }: { config: FigureConfig; painted: boolean }) {
  const g = useRef<THREE.Group>(null);
  const pop = useRef(0);
  const key = JSON.stringify(config) + painted;

  useEffect(() => {
    pop.current = 1;
  }, [key]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    pop.current = damp(pop.current, 0, 6, dt);
    if (!g.current) return;
    const k = Math.sin(pop.current * Math.PI);
    g.current.scale.set(1 + k * 0.05, 1 - k * 0.06, 1 + k * 0.05);
    g.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.025;
  });

  return (
    <>
      <OrbitControls makeDefault target={[0, 1.0, 0]} enablePan={false} minDistance={3.2} maxDistance={8.5} minPolarAngle={0.4} maxPolarAngle={1.6} enableDamping />
      <Pedestal radius={0.95} accent={config.topColor} />
      <group ref={g}>
        <Figurine config={{ ...config, held: config.pose === "hold" ? "bouquet" : "none" }} painted={painted} follow={0.5} />
      </group>
      <ContactShadows position={[0, 0.002, 0]} scale={1.9} blur={2.2} far={2.4} opacity={0.5} resolution={512} color="#5b4a3a" />
    </>
  );
}
