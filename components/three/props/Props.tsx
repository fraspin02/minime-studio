"use client";

import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { geo, resin, RAW_RESIN } from "../resources";

type G = ThreeElements["group"];

/* -------------------------------- Pedestal -------------------------------- */

export const Pedestal = forwardRef<THREE.Group, G & { color?: string; accent?: string; radius?: number }>(
  function Pedestal({ color = "#f4efe7", accent = "#a58bfa", radius = 1, ...rest }, ref) {
    return (
      <group ref={ref} {...rest}>
        <mesh geometry={geo.cylinder(radius, radius * 1.04, 0.22, 64)} material={resin(color, { roughness: 0.55 })} position={[0, -0.11, 0]} />
        <mesh geometry={geo.cylinder(radius * 1.045, radius * 1.045, 0.025, 64)} material={resin(accent, { roughness: 0.4 })} position={[0, -0.235, 0]} />
        <mesh geometry={geo.cylinder(radius * 1.07, radius * 1.1, 0.12, 64)} material={resin(color, { roughness: 0.6 })} position={[0, -0.31, 0]} />
      </group>
    );
  }
);

/* -------------------------------- Paint jar -------------------------------- */

export const PaintJar = forwardRef<THREE.Group, G & { color: string }>(function PaintJar({ color, ...rest }, ref) {
  return (
    <group ref={ref} {...rest}>
      <mesh geometry={geo.cylinder(0.16, 0.16, 0.2, 32)} material={resin("#fbfaf7", { roughness: 0.25 })} position={[0, 0.1, 0]} />
      <mesh geometry={geo.cylinder(0.145, 0.145, 0.17, 32)} material={resin(color, { roughness: 0.35 })} position={[0, 0.095, 0]} scale={[1.04, 1, 1.04]} />
      <mesh geometry={geo.cylinder(0.168, 0.168, 0.07, 32)} material={resin("#fbfaf7", { roughness: 0.5 })} position={[0, 0.235, 0]} />
      <mesh geometry={geo.cylinder(0.11, 0.11, 0.012, 32)} material={resin(color, { roughness: 0.35 })} position={[0, 0.272, 0]} />
    </group>
  );
});

/* ---------------------------------- Brush ---------------------------------- */

export const Brush = forwardRef<THREE.Group, G & { color?: string; tip?: string; length?: number }>(function Brush(
  { color = "#a58bfa", tip = "#ffe29a", length = 1.1, ...rest },
  ref
) {
  return (
    <group ref={ref} {...rest}>
      <mesh geometry={geo.cylinder(0.035, 0.022, length, 20)} material={resin(color, { roughness: 0.35 })} position={[0, -length / 2, 0]} />
      <mesh geometry={geo.sphere(16)} material={resin(color, { roughness: 0.35 })} position={[0, -length, 0]} scale={0.024} />
      <mesh geometry={geo.cylinder(0.04, 0.036, 0.14, 20)} material={resin("#d8d4cf", { roughness: 0.25, metalness: 0.75 })} position={[0, 0.07, 0]} />
      <mesh geometry={geo.cone(0.042, 0.17)} material={resin("#3a2e26", { roughness: 0.8 })} position={[0, 0.22, 0]} />
      <mesh geometry={geo.cone(0.026, 0.07)} material={resin(tip, { roughness: 0.4 })} position={[0, 0.28, 0]} />
    </group>
  );
});

/* -------------------------------- Gift box -------------------------------- */

function useLabelTexture() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const draw = () => {
      ctx.clearRect(0, 0, 512, 512);
      ctx.fillStyle = "#242424";
      ctx.textAlign = "center";
      ctx.font = '800 88px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
      ctx.fillText("MiniMe", 256, 250);
      ctx.font = '700 30px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = "8px";
      ctx.fillText("COLOR KIT", 256, 310);
      ctx.beginPath();
      ctx.arc(256, 380, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#a58bfa";
      ctx.fill();
    };
    draw();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    document.fonts?.ready.then(() => {
      draw();
      t.needsUpdate = true;
    });
    return t;
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

export function GiftBoxBase({ color = "#fbfaf7", ribbon = "#a58bfa", ...rest }: G & { color?: string; ribbon?: string }) {
  const label = useLabelTexture();
  const w = 1.7;
  const h = 1.0;
  return (
    <group {...rest}>
      <RoundedBox args={[w, h, w]} radius={0.06} smoothness={4} position={[0, h / 2, 0]} material={resin(color, { roughness: 0.7 })} />
      {/* inside shadow */}
      <mesh geometry={geo.box(w - 0.12, 0.02, w - 0.12)} material={resin("#e2dbcf", { roughness: 0.9 })} position={[0, h - 0.005, 0]} />
      <mesh geometry={geo.box(0.2, h + 0.004, w + 0.012)} material={resin(ribbon, { roughness: 0.45 })} position={[0, h / 2, 0]} />
      <mesh geometry={geo.box(w + 0.012, h + 0.004, 0.2)} material={resin(ribbon, { roughness: 0.45 })} position={[0, h / 2, 0]} />
      {label && (
        <mesh position={[0.48, h / 2, w / 2 + 0.008]}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

export const GiftBoxLid = forwardRef<THREE.Group, G & { color?: string; ribbon?: string }>(function GiftBoxLid(
  { color = "#fbfaf7", ribbon = "#a58bfa", ...rest },
  ref
) {
  const w = 1.82;
  return (
    <group ref={ref} {...rest}>
      <RoundedBox args={[w, 0.26, w]} radius={0.06} smoothness={4} material={resin(color, { roughness: 0.7 })} />
      <mesh geometry={geo.box(0.21, 0.27, w + 0.012)} material={resin(ribbon, { roughness: 0.45 })} />
      <mesh geometry={geo.box(w + 0.012, 0.27, 0.21)} material={resin(ribbon, { roughness: 0.45 })} />
      {[1, -1].map((s) => (
        <mesh key={s} geometry={geo.torus(0.2, 0.065)} material={resin(ribbon, { roughness: 0.45 })} position={[0.2 * s, 0.25, 0]} rotation={[0, 0, 0.5 * s]} scale={[1.1, 0.7, 0.9]} />
      ))}
      <mesh geometry={geo.sphere(24)} material={resin(ribbon, { roughness: 0.45 })} position={[0, 0.2, 0]} scale={0.1} />
    </group>
  );
});

/* ------------------------------ Photo card ------------------------------ */

export type PhotoTheme = "couple" | "friends" | "pet" | "grad" | "party";

const THEMES: Record<PhotoTheme, { sky: [string, string, string]; people: { x: number; top: string; hair: string; skin: string; h: number }[] }> = {
  couple: {
    sky: ["#ffd9b8", "#f9c6d3", "#c8b6ff"],
    people: [
      { x: 0.4, top: "#bfd2ec", hair: "#2a201b", skin: "#e6b48f", h: 0.9 },
      { x: 0.6, top: "#1f1f22", hair: "#2b211c", skin: "#e6b48f", h: 1 },
    ],
  },
  friends: {
    sky: ["#fff2c4", "#ffe29a", "#f9dce5"],
    people: [
      { x: 0.3, top: "#ffe29a", hair: "#1f1a17", skin: "#cf9a72", h: 0.9 },
      { x: 0.52, top: "#a58bfa", hair: "#c08a4e", skin: "#f3cfb3", h: 1 },
      { x: 0.73, top: "#9fc49a", hair: "#3a2a20", skin: "#e6b48f", h: 0.95 },
    ],
  },
  pet: {
    sky: ["#dff0ff", "#e8e1ff", "#fbe3ea"],
    people: [{ x: 0.42, top: "#f9dce5", hair: "#16110f", skin: "#94603f", h: 1 }],
  },
  grad: {
    sky: ["#e6f0ff", "#d8ccff", "#fff2c4"],
    people: [{ x: 0.5, top: "#2d2b3f", hair: "#6b4630", skin: "#f3cfb3", h: 1 }],
  },
  party: {
    sky: ["#ffe1ec", "#ffd5a8", "#ffe29a"],
    people: [{ x: 0.5, top: "#f9dce5", hair: "#8a5a3b", skin: "#f3cfb3", h: 1 }],
  },
};

/** Paints a soft, illustrative "sample photo" into a canvas texture. */
export function makePhotoTexture(theme: PhotoTheme) {
  const W = 512;
  const H = 600;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const t = THEMES[theme];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, t.sky[2]);
  g.addColorStop(0.55, t.sky[1]);
  g.addColorStop(1, t.sky[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // sun
  const sun = ctx.createRadialGradient(W * 0.72, H * 0.3, 10, W * 0.72, H * 0.3, 160);
  sun.addColorStop(0, "rgba(255,248,225,0.95)");
  sun.addColorStop(1, "rgba(255,248,225,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  // hills
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.7);
  ctx.quadraticCurveTo(W * 0.3, H * 0.58, W * 0.6, H * 0.68);
  ctx.quadraticCurveTo(W * 0.85, H * 0.75, W, H * 0.66);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  // people (soft-focus silhouettes)
  ctx.filter = "blur(1.5px)";
  for (const p of t.people) {
    const cx = p.x * W;
    const base = H * 0.98;
    const s = p.h;
    ctx.fillStyle = p.top;
    roundRect(ctx, cx - 62 * s, base - 250 * s, 124 * s, 260 * s, 50 * s);
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.ellipse(cx, base - 300 * s, 52 * s, 60 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    ctx.ellipse(cx, base - 322 * s, 58 * s, 50 * s, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  if (theme === "pet") {
    ctx.fillStyle = "#c9925e";
    ctx.beginPath();
    ctx.ellipse(W * 0.72, H * 0.9, 70, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W * 0.78, H * 0.78, 40, 38, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "none";
  // film grain
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
}

/** A polaroid-like photo print, used as the "input" of the MiniMe process. */
export const PhotoCard = forwardRef<THREE.Group, G & { theme?: PhotoTheme; opacity?: number }>(function PhotoCard(
  { theme = "couple", ...rest },
  ref
) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : makePhotoTexture(theme)), [theme]);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fdfcf9", roughness: 0.55, transparent: true }), []);
  const photoMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }), [tex]);
  useEffect(
    () => () => {
      tex?.dispose();
      frameMat.dispose();
      photoMat.dispose();
    },
    [tex, frameMat, photoMat]
  );
  return (
    <group ref={ref} {...rest} userData={{ fade: [frameMat, photoMat] }}>
      <RoundedBox args={[1.6, 1.92, 0.035]} radius={0.015} smoothness={2} material={frameMat} />
      <mesh position={[0, 0.12, 0.019]} material={photoMat}>
        <planeGeometry args={[1.42, 1.56]} />
      </mesh>
    </group>
  );
});

/** Utility to fade a PhotoCard group (reads materials stored in userData). */
export function setPhotoOpacity(group: THREE.Object3D | null, o: number) {
  const mats = group?.userData?.fade as THREE.Material[] | undefined;
  if (!mats) return;
  for (const m of mats) {
    m.opacity = o;
    m.depthWrite = o > 0.98;
  }
  group!.visible = o > 0.01;
}

export { RAW_RESIN };
