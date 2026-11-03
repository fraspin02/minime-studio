"use client";

import { forwardRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { Figurine } from "./Figurine";
import { PRESETS } from "./types";

type Props = ThreeElements["group"] & { painted?: boolean; overrideMaterial?: THREE.Material; lowDetail?: boolean };

/** The hugging couple from the reference photo. */
export const Couple = forwardRef<THREE.Group, Props>(function Couple(
  { painted = true, overrideMaterial, lowDetail, ...rest },
  ref
) {
  return (
    <group ref={ref} {...rest}>
      <Figurine
        config={PRESETS.her}
        painted={painted}
        overrideMaterial={overrideMaterial}
        lowDetail={lowDetail}
        position={[-0.26, 0, 0.06]}
        rotation={[0, Math.PI / 2 - 0.12, 0]}
        headTilt={[-0.12, 0.12, 0.08]}
        scale={0.96}
      />
      <Figurine
        config={PRESETS.him}
        painted={painted}
        overrideMaterial={overrideMaterial}
        lowDetail={lowDetail}
        position={[0.27, 0, -0.04]}
        rotation={[0, -Math.PI / 2 + 0.28, 0]}
        headTilt={[0.04, -0.35, -0.04]}
        scale={1.04}
      />
    </group>
  );
});
