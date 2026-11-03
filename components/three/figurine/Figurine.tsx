"use client";

import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { geo, resin, RAW_RESIN } from "../resources";
import { damp, seeded } from "@/lib/math";
import type { FigureConfig, Pose } from "./types";

/* ------------------------------------------------------------------ */
/*  Pose table (angles expressed for the figure's LEFT arm, +x side;   */
/*  the right arm mirrors z/y).                                        */
/* ------------------------------------------------------------------ */

type ArmPose = { sx: number; sy: number; sz: number; ex: number; ez: number };
const A = (sx: number, sz: number, ex: number, ez: number, sy = 0): ArmPose => ({ sx, sy, sz, ex, ez });

const POSES: Record<Pose, { l: ArmPose; r: ArmPose }> = {
  stand: { l: A(0.04, 0.17, -0.22, 0), r: A(0.04, 0.17, -0.22, 0) },
  wave: { l: A(0.04, 0.17, -0.22, 0), r: A(-0.12, 2.1, 0, 0.5) },
  cheer: { l: A(-0.2, 2.3, 0, 0.2), r: A(-0.2, 2.3, 0, 0.2) },
  hips: { l: A(0.12, 0.78, 0, -1.95), r: A(0.12, 0.78, 0, -1.95) },
  hold: { l: A(-0.95, 0.12, -0.7, -0.15), r: A(-0.95, 0.12, -0.7, -0.15) },
  hugNeck: { l: A(-2.25, 0.2, -0.2, -1.2, 0.0), r: A(-2.25, 0.2, -0.2, -1.2, 0.0) },
  hugWaist: { l: A(-1.05, 0.3, -0.1, -1.45), r: A(-1.05, 0.3, -0.1, -1.45) },
};

const WAVE_ARM = A(-0.12, 2.1, 0, 0.5);

export type FigurineProps = ThreeElements["group"] & {
  config: FigureConfig;
  /** false → raw white resin, as the statuette arrives in the kit. */
  painted?: boolean;
  /** Replace every material (used for 3D-print / wireframe effects). */
  overrideMaterial?: THREE.Material;
  /** 0..1 — how much the head follows the pointer. */
  follow?: number;
  /** Extra static head rotation (radians). */
  headTilt?: [number, number, number];
  /** Animate a friendly wave with the right arm. */
  waving?: boolean;
  /** Lower-poly curls on small devices. */
  lowDetail?: boolean;
};

export const Figurine = forwardRef<THREE.Group, FigurineProps>(function Figurine(
  { config, painted = true, overrideMaterial, follow = 0, headTilt = [0, 0, 0], waving = false, lowDetail = false, ...rest },
  ref
) {
  const head = useRef<THREE.Group>(null);
  const lS = useRef<THREE.Group>(null);
  const lE = useRef<THREE.Group>(null);
  const rS = useRef<THREE.Group>(null);
  const rE = useRef<THREE.Group>(null);

  const m = useMemo(() => {
    return (color: string, roughness = 0.62, side: THREE.Side = THREE.FrontSide) => {
      if (overrideMaterial) return overrideMaterial;
      if (!painted) return resin(RAW_RESIN, { roughness: 0.68, side });
      return resin(color, { roughness, side });
    };
  }, [painted, overrideMaterial]);

  const { skin, hairColor, topColor, bottomColor, shoeColor, outfit } = config;
  const sleeveMat = outfit === "crop" || outfit === "dress" ? m(skin) : m(topColor, 0.7);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    // Arms damp towards their target pose → smooth pose changes.
    const pose = POSES[config.pose];
    const apply = (s: THREE.Group | null, e: THREE.Group | null, p: ArmPose, mirror: number, wave: boolean) => {
      if (!s || !e) return;
      const target = wave ? WAVE_ARM : p;
      const waveOsc = wave ? Math.sin(t * 7) * 0.32 : 0;
      s.rotation.x = damp(s.rotation.x, target.sx, 6, d);
      s.rotation.y = damp(s.rotation.y, target.sy * mirror, 6, d);
      s.rotation.z = damp(s.rotation.z, target.sz * mirror, 6, d);
      e.rotation.x = damp(e.rotation.x, target.ex, 6, d);
      e.rotation.z = damp(e.rotation.z, (target.ez + waveOsc) * mirror, wave ? 14 : 6, d);
    };
    const isWave = waving || config.pose === "wave";
    apply(lS.current, lE.current, pose.l, 1, false);
    apply(rS.current, rE.current, pose.r, -1, isWave);

    if (head.current) {
      const px = follow ? state.pointer.x * 0.45 * follow : 0;
      const py = follow ? -state.pointer.y * 0.22 * follow : 0;
      const idle = Math.sin(t * 0.9) * 0.025;
      head.current.rotation.y = damp(head.current.rotation.y, headTilt[1] + px, 4, d);
      head.current.rotation.x = damp(head.current.rotation.x, headTilt[0] + py, 4, d);
      head.current.rotation.z = damp(head.current.rotation.z, headTilt[2] + idle, 4, d);
    }
  });

  return (
    <group ref={ref} {...rest}>
      <Legs config={config} m={m} />
      <Torso config={config} m={m} />

      {/* neck */}
      <mesh geometry={geo.cylinder(0.075, 0.085, 0.18, 24)} material={m(skin)} position={[0, 1.14, 0]} />

      {/* arms */}
      <group ref={lS} position={[0.245, 1.0, 0]}>
        <Arm skinMat={m(skin)} sleeveMat={sleeveMat} outfit={outfit} elbowRef={lE} />
      </group>
      <group ref={rS} position={[-0.245, 1.0, 0]}>
        <Arm skinMat={m(skin)} sleeveMat={sleeveMat} outfit={outfit} elbowRef={rE} />
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.52, 0]}>
        <mesh geometry={geo.sphere(48)} material={m(skin, 0.58)} scale={[0.44, 0.415, 0.405]} />
        <Face config={config} m={m} painted={painted && !overrideMaterial} />
        <Hair config={config} m={m} lowDetail={lowDetail} />
        <AccessoryMesh config={config} m={m} />
      </group>

      {config.held && config.held !== "none" && <Held kind={config.held} m={m} />}
    </group>
  );
});

type M = (color: string, roughness?: number, side?: THREE.Side) => THREE.Material;

/* ------------------------------------------------------------------ */

function Arm({
  skinMat,
  sleeveMat,
  outfit,
  elbowRef,
}: {
  skinMat: THREE.Material;
  sleeveMat: THREE.Material;
  outfit: FigureConfig["outfit"];
  elbowRef: React.RefObject<THREE.Group | null>;
}) {
  const longSleeve = outfit === "hoodie" || outfit === "gown";
  const shortSleeve = outfit === "tee";
  return (
    <>
      <mesh geometry={geo.sphere(24)} material={shortSleeve || longSleeve ? sleeveMat : skinMat} scale={0.08} />
      <mesh
        geometry={geo.capsule(longSleeve ? 0.078 : 0.066, 0.14)}
        material={longSleeve ? sleeveMat : skinMat}
        position={[0, -0.12, 0]}
      />
      {shortSleeve && (
        <mesh geometry={geo.cylinder(0.082, 0.094, 0.16, 28)} material={sleeveMat} position={[0, -0.06, 0]} />
      )}
      <group ref={elbowRef} position={[0, -0.245, 0]}>
        <mesh
          geometry={geo.capsule(longSleeve ? 0.074 : 0.06, 0.12)}
          material={longSleeve ? sleeveMat : skinMat}
          position={[0, -0.1, 0]}
        />
        {outfit === "gown" && (
          <mesh geometry={geo.cylinder(0.08, 0.11, 0.16, 28, true)} material={sleeveMat} position={[0, -0.13, 0]} />
        )}
        <mesh geometry={geo.sphere(24)} material={skinMat} position={[0, -0.235, 0]} scale={[0.074, 0.082, 0.068]} />
      </group>
    </>
  );
}

function Torso({ config, m }: { config: FigureConfig; m: M }) {
  const { outfit, skin, topColor } = config;
  if (outfit === "crop") {
    return (
      <>
        <mesh geometry={geo.capsule(0.205, 0.2)} material={m(skin)} position={[0, 0.86, 0]} scale={[1, 1, 0.82]} />
        <mesh geometry={geo.sphere(40)} material={m(topColor, 0.72)} position={[0, 0.975, 0]} scale={[0.228, 0.205, 0.19]} />
        {/* straps */}
        <mesh geometry={geo.capsule(0.022, 0.1)} material={m(topColor, 0.72)} position={[0.11, 1.13, 0.02]} rotation={[0, 0, 0.2]} />
        <mesh geometry={geo.capsule(0.022, 0.1)} material={m(topColor, 0.72)} position={[-0.11, 1.13, 0.02]} rotation={[0, 0, -0.2]} />
      </>
    );
  }
  return (
    <>
      <mesh geometry={geo.capsule(0.228, 0.2)} material={m(topColor, 0.74)} position={[0, 0.86, 0]} scale={[1, 1, 0.82]} />
      {outfit === "hoodie" && (
        <>
          <mesh geometry={geo.torus(0.15, 0.06)} material={m(topColor, 0.74)} position={[0, 1.13, -0.05]} rotation={[1.25, 0, 0]} />
          <mesh geometry={geo.capsule(0.012, 0.12)} material={m("#fbfaf7")} position={[0.06, 0.98, 0.18]} />
          <mesh geometry={geo.capsule(0.012, 0.12)} material={m("#fbfaf7")} position={[-0.06, 0.98, 0.18]} />
          <mesh geometry={geo.sphere(24)} material={m(topColor, 0.8)} position={[0, 0.72, 0.16]} scale={[0.15, 0.07, 0.05]} />
        </>
      )}
      {outfit === "tee" && (
        <mesh geometry={geo.torus(0.09, 0.016)} material={m(topColor, 0.74)} position={[0, 1.12, 0.035]} rotation={[1.35, 0, 0]} />
      )}
      {outfit === "gown" && (
        <mesh geometry={geo.cone(0.11, 0.2)} material={m("#fbfaf7")} position={[0, 1.04, 0.15]} rotation={[Math.PI + 0.35, 0, 0]} scale={[1, 1, 0.4]} />
      )}
    </>
  );
}

function Legs({ config, m }: { config: FigureConfig; m: M }) {
  const { outfit, skin, bottomColor, shoeColor } = config;
  const pants = outfit === "tee" || outfit === "hoodie";
  const skirt = outfit === "crop" || outfit === "dress";
  const skirtColor = outfit === "dress" ? config.topColor : bottomColor;
  const shoes = (
    <>
      {[0.112, -0.112].map((x) => (
        <group key={x} position={[x, 0, 0.04]}>
          <mesh geometry={geo.sphere(32)} material={m(shoeColor, 0.55)} position={[0, 0.09, 0]} scale={[0.118, 0.088, 0.19]} />
          <mesh geometry={geo.sphere(32)} material={m("#e9e4dc", 0.7)} position={[0, 0.045, 0.004]} scale={[0.124, 0.045, 0.198]} />
        </group>
      ))}
    </>
  );

  if (outfit === "gown") {
    return (
      <>
        {shoes}
        <mesh geometry={geo.cylinder(0.235, 0.37, 0.78, 48)} material={m(config.topColor, 0.74)} position={[0, 0.53, 0]} scale={[1, 1, 0.86]} />
      </>
    );
  }

  return (
    <>
      {shoes}
      {[0.112, -0.112].map((x) =>
        pants ? (
          <mesh key={x} geometry={geo.cylinder(0.112, 0.128, 0.5, 32)} material={m(bottomColor, 0.82)} position={[x, 0.39, 0]} />
        ) : (
          <group key={x}>
            <mesh geometry={geo.capsule(0.074, 0.36)} material={m(skin)} position={[x * 0.92, 0.4, 0]} />
            <mesh geometry={geo.cylinder(0.084, 0.086, 0.08, 24)} material={m("#fbfaf7", 0.8)} position={[x * 0.95, 0.17, 0.01]} />
          </group>
        )
      )}
      {pants && (
        <mesh geometry={geo.sphere(40)} material={m(bottomColor, 0.82)} position={[0, 0.62, 0]} scale={[0.25, 0.14, 0.195]} />
      )}
      {skirt && (
        <>
          <mesh geometry={geo.sphere(40)} material={m(skirtColor, 0.7)} position={[0, 0.72, 0]} scale={[0.215, 0.09, 0.18]} />
          <mesh geometry={geo.ruffle(0.205, 0.3, 0.17)} material={m(skirtColor, 0.7, THREE.DoubleSide)} position={[0, 0.635, 0]} scale={[1, 1, 0.88]} />
          <mesh geometry={geo.ruffle(0.28, 0.37, 0.12)} material={m(skirtColor, 0.7, THREE.DoubleSide)} position={[0, 0.52, 0]} scale={[1, 1, 0.88]} />
        </>
      )}
    </>
  );
}

function Face({ config, m, painted }: { config: FigureConfig; m: M; painted: boolean }) {
  const eye = painted ? resin("#191512", { roughness: 0.16 }) : m("#191512");
  const brow = m(config.hairColor, 0.7);
  return (
    <>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.sphere(24)} material={eye} position={[0.152 * s, -0.005, 0.37]} rotation={[0, 0.36 * s, 0]} scale={[0.052, 0.074, 0.032]} />
          <mesh geometry={geo.capsule(0.014, 0.055)} material={brow} position={[0.15 * s, 0.128, 0.372]} rotation={[0.1, 0.35 * s, Math.PI / 2 - 0.14 * s]} />
          <mesh geometry={geo.sphere(20)} material={m(config.skin)} position={[0.432 * s, -0.04, 0]} scale={[0.05, 0.08, 0.065]} />
          {painted && (
            <mesh geometry={geo.sphere(20)} material={resin("#f2a69c", { roughness: 0.85 })} position={[0.24 * s, -0.105, 0.318]} rotation={[0, 0.62 * s, 0]} scale={[0.062, 0.034, 0.018]} />
          )}
        </group>
      ))}
      <mesh geometry={geo.sphere(20)} material={m(config.skin)} position={[0, -0.09, 0.398]} scale={[0.032, 0.026, 0.026]} />
      <mesh geometry={geo.torus(0.036, 0.0105, Math.PI)} material={painted ? resin("#a85750", { roughness: 0.5 }) : m("#a85750")} position={[0, -0.168, 0.37]} rotation={[-0.25, 0, Math.PI]} />
    </>
  );
}

function Hair({ config, m, lowDetail }: { config: FigureConfig; m: M; lowDetail: boolean }) {
  const mat = m(config.hairColor, 0.72);
  const shellMat = m(config.hairColor, 0.72, THREE.DoubleSide);
  const capped = config.accessory === "cap" || config.accessory === "gradcap";
  const shell = <mesh geometry={geo.cap(0.462, 1.42)} material={shellMat} position={[0, 0.02, -0.012]} rotation={[-0.42, 0, 0]} />;

  switch (config.hair) {
    case "long":
      return (
        <>
          {shell}
          <mesh geometry={geo.sphere(40)} material={mat} position={[0, -0.3, -0.17]} scale={[0.47, 0.64, 0.3]} />
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh geometry={geo.sphere(32)} material={mat} position={[0.372 * s, -0.24, 0.05]} rotation={[0.08, 0, 0.12 * s]} scale={[0.125, 0.5, 0.2]} />
              <mesh geometry={geo.sphere(24)} material={mat} position={[0.3 * s, -0.7, -0.02]} scale={[0.15, 0.17, 0.15]} />
              <mesh geometry={geo.sphere(24)} material={mat} position={[0.17 * s, 0.31, 0.25]} rotation={[0.45, 0, -0.55 * s]} scale={[0.25, 0.1, 0.15]} />
            </group>
          ))}
          <mesh geometry={geo.sphere(24)} material={mat} position={[0, -0.82, -0.18]} scale={[0.22, 0.16, 0.16]} />
        </>
      );
    case "short":
      return (
        <>
          {shell}
          <mesh geometry={geo.sphere(32)} material={mat} position={[0.07, 0.3, 0.27]} rotation={[0.5, 0, -0.38]} scale={[0.3, 0.11, 0.17]} />
          <mesh geometry={geo.sphere(32)} material={mat} position={[0, 0.1, -0.12]} scale={[0.46, 0.4, 0.36]} />
        </>
      );
    case "bun":
      return (
        <>
          {shell}
          <mesh geometry={geo.sphere(32)} material={mat} position={[0, 0.47, -0.12]} scale={0.17} />
          <mesh geometry={geo.torus(0.1, 0.03)} material={m(config.accessoryColor)} position={[0, 0.36, -0.08]} rotation={[1.2, 0, 0]} />
          {[1, -1].map((s) => (
            <mesh key={s} geometry={geo.sphere(24)} material={mat} position={[0.17 * s, 0.31, 0.26]} rotation={[0.45, 0, -0.55 * s]} scale={[0.24, 0.09, 0.14]} />
          ))}
        </>
      );
    case "curly":
    default:
      return (
        <>
          {shell}
          <Curls material={mat} count={lowDetail ? 90 : 150} capped={capped} />
        </>
      );
  }
}

function Curls({ material, count, capped }: { material: THREE.Material; count: number; capped: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const rand = seeded(7);
    const out: THREE.Matrix4[] = [];
    const d = new THREE.Vector3();
    const q = new THREE.Quaternion();
    let guard = 0;
    while (out.length < count && guard++ < 5000) {
      d.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      if (d.lengthSq() > 1 || d.lengthSq() < 0.01) continue;
      d.normalize();
      if (d.z > 0.12 && d.y < 0.48) continue; // keep the face clear
      if (d.y < -0.42) continue; // neck
      if (d.y < 0.05 && d.z > -0.35) continue; // ears
      if (capped && d.y > 0.4) continue;
      const r = 0.46 + rand() * 0.055;
      const s = 0.075 + rand() * 0.04;
      const p = new THREE.Vector3(d.x * r, 0.05 + d.y * r * 1.1, -0.03 + d.z * r);
      q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
      out.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(s, s * 0.92, s)));
    }
    return out;
  }, [count, capped]);

  const setRef = (mesh: THREE.InstancedMesh | null) => {
    (ref as React.MutableRefObject<THREE.InstancedMesh | null>).current = mesh;
    if (!mesh) return;
    matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };

  return <instancedMesh key={matrices.length} ref={setRef} args={[geo.sphere(16), material, matrices.length]} />;
}

function AccessoryMesh({ config, m }: { config: FigureConfig; m: M }) {
  const c = config.accessoryColor;
  switch (config.accessory) {
    case "glasses":
      return (
        <group>
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh geometry={geo.torus(0.088, 0.013)} material={m(c, 0.4)} position={[0.152 * s, -0.005, 0.415]} rotation={[0, 0.25 * s, 0]} />
              <mesh geometry={geo.capsule(0.01, 0.34)} material={m(c, 0.4)} position={[0.41 * s, 0.01, 0.18]} rotation={[Math.PI / 2, 0, 0.1 * s]} />
            </group>
          ))}
          <mesh geometry={geo.capsule(0.01, 0.07)} material={m(c, 0.4)} position={[0, 0.02, 0.43]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      );
    case "cap":
      return (
        <group position={[0, 0.1, -0.02]} rotation={[-0.32, 0, 0]}>
          <mesh geometry={geo.cap(0.5, Math.PI / 2)} material={m(c, 0.75, THREE.DoubleSide)} />
          <mesh geometry={geo.cylinder(0.27, 0.27, 0.026, 40)} material={m(c, 0.75)} position={[0, 0.04, 0.44]} rotation={[0.22, 0, 0]} scale={[1, 1, 0.75]} />
          <mesh geometry={geo.sphere(16)} material={m(c, 0.75)} position={[0, 0.5, 0]} scale={0.035} />
        </group>
      );
    case "partyhat":
      return (
        <group position={[0.12, 0.6, 0.02]} rotation={[0, 0, -0.24]}>
          <mesh geometry={geo.cone(0.16, 0.42)} material={m(c, 0.6)} />
          <mesh geometry={geo.torus(0.12, 0.018)} material={m("#fbfaf7")} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.torus(0.07, 0.016)} material={m("#fbfaf7")} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.sphere(20)} material={m("#ffe29a", 0.8)} position={[0, 0.23, 0]} scale={0.06} />
        </group>
      );
    case "gradcap":
      return (
        <group position={[0, 0.36, -0.02]} rotation={[-0.14, 0, 0]}>
          <mesh geometry={geo.cylinder(0.34, 0.37, 0.18, 40)} material={m(c, 0.7)} />
          <mesh geometry={geo.box(0.86, 0.035, 0.86)} material={m(c, 0.7)} position={[0, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} />
          <mesh geometry={geo.sphere(16)} material={m("#ffe29a", 0.6)} position={[0, 0.125, 0]} scale={0.035} />
          <mesh geometry={geo.capsule(0.008, 0.26)} material={m("#ffe29a", 0.6)} position={[0.58, -0.03, 0]} />
          <mesh geometry={geo.cone(0.04, 0.12)} material={m("#ffe29a", 0.8)} position={[0.58, -0.2, 0]} />
          <mesh geometry={geo.capsule(0.008, 0.55)} material={m("#ffe29a", 0.6)} position={[0.3, 0.125, 0]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      );
    case "flower":
      return (
        <group position={[0.31, 0.3, 0.2]} rotation={[0, 0.8, 0.2]}>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh key={i} geometry={geo.sphere(16)} material={m(c, 0.6)} position={[Math.cos(a) * 0.055, Math.sin(a) * 0.055, 0]} scale={[0.05, 0.05, 0.025]} />
            );
          })}
          <mesh geometry={geo.sphere(16)} material={m("#ffe29a", 0.6)} position={[0, 0, 0.015]} scale={0.032} />
        </group>
      );
    default:
      return null;
  }
}

function Held({ kind, m }: { kind: NonNullable<FigureConfig["held"]>; m: M }) {
  if (kind === "diploma") {
    return (
      <group position={[0, 0.86, 0.44]}>
        <mesh geometry={geo.cylinder(0.05, 0.05, 0.56, 24)} material={m("#fbf6ea", 0.8)} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={geo.torus(0.054, 0.014)} material={m("#d4584f", 0.6)} rotation={[0, Math.PI / 2, 0]} />
      </group>
    );
  }
  if (kind === "cake") {
    return (
      <group position={[0, 0.8, 0.42]}>
        <mesh geometry={geo.cylinder(0.22, 0.22, 0.02, 40)} material={m("#fbfaf7", 0.5)} position={[0, -0.08, 0]} />
        <mesh geometry={geo.cylinder(0.17, 0.17, 0.14, 40)} material={m("#fff1d6", 0.7)} />
        <mesh geometry={geo.cylinder(0.175, 0.175, 0.04, 40)} material={m("#f6a9bf", 0.55)} position={[0, 0.07, 0]} />
        <mesh geometry={geo.cylinder(0.012, 0.012, 0.12, 12)} material={m("#a58bfa", 0.5)} position={[0, 0.15, 0]} />
        <mesh geometry={geo.sphere(12)} material={m("#ffd36b", 0.4)} position={[0, 0.23, 0]} scale={[0.02, 0.035, 0.02]} />
      </group>
    );
  }
  return (
    <group position={[0, 0.88, 0.44]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} geometry={geo.sphere(16)} material={m(i % 2 ? "#f6a9bf" : "#ffe29a", 0.6)} position={[Math.cos(i * 1.3) * 0.07, 0.16 + Math.sin(i * 1.7) * 0.04, Math.sin(i * 1.3) * 0.07]} scale={0.06} />
      ))}
      <mesh geometry={geo.cone(0.09, 0.26)} material={m("#9fc49a", 0.7)} rotation={[Math.PI, 0, 0]} />
    </group>
  );
}
