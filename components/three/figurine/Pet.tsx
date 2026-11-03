"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { geo, resin, RAW_RESIN } from "../resources";

/** A small sitting puppy, same resin language as the statuettes. */
export function Pet({ painted = true, ...rest }: ThreeElements["group"] & { painted?: boolean }) {
  const tail = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const c = (col: string, r = 0.6) => resin(painted ? col : RAW_RESIN, { roughness: painted ? r : 0.68 });
  const fur = "#d39b62";
  const cream = "#f6e7d2";

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (tail.current) tail.current.rotation.z = 0.6 + Math.sin(t * 9) * 0.35;
    if (head.current) head.current.rotation.z = Math.sin(t * 1.3) * 0.08;
  });

  return (
    <group {...rest}>
      {/* body */}
      <mesh geometry={geo.sphere(32)} material={c(fur)} position={[0, 0.3, -0.05]} scale={[0.24, 0.3, 0.26]} />
      <mesh geometry={geo.sphere(24)} material={c(cream)} position={[0, 0.3, 0.14]} scale={[0.15, 0.2, 0.1]} />
      {/* legs */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.capsule(0.055, 0.16)} material={c(fur)} position={[0.1 * s, 0.13, 0.12]} />
          <mesh geometry={geo.sphere(16)} material={c(cream)} position={[0.1 * s, 0.035, 0.16]} scale={[0.065, 0.04, 0.08]} />
          <mesh geometry={geo.sphere(20)} material={c(fur)} position={[0.17 * s, 0.11, -0.1]} scale={[0.09, 0.1, 0.16]} />
        </group>
      ))}
      <mesh ref={tail} geometry={geo.capsule(0.035, 0.18)} material={c(fur)} position={[0.0, 0.25, -0.3]} rotation={[0.9, 0, 0.6]} />
      {/* head */}
      <group ref={head} position={[0, 0.7, 0.05]}>
        <mesh geometry={geo.sphere(32)} material={c(fur)} scale={[0.25, 0.23, 0.22]} />
        <mesh geometry={geo.sphere(24)} material={c(cream)} position={[0, -0.06, 0.17]} scale={[0.13, 0.1, 0.11]} />
        <mesh geometry={geo.sphere(16)} material={painted ? resin("#191512", { roughness: 0.2 }) : c("#191512")} position={[0, -0.02, 0.28]} scale={[0.04, 0.03, 0.03]} />
        {[1, -1].map((s) => (
          <group key={s}>
            <mesh geometry={geo.sphere(16)} material={painted ? resin("#191512", { roughness: 0.16 }) : c("#191512")} position={[0.09 * s, 0.05, 0.19]} scale={[0.03, 0.04, 0.02]} />
            <mesh geometry={geo.sphere(20)} material={c("#a8713f")} position={[0.21 * s, 0.02, -0.02]} rotation={[0, 0, 0.35 * s]} scale={[0.07, 0.16, 0.1]} />
          </group>
        ))}
      </group>
    </group>
  );
}
