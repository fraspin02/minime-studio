import * as THREE from "three";

/**
 * Small, bounded caches of shared geometries and materials.
 * Every statuette re-uses the same handful of GPU resources,
 * keeping draw-call setup and memory low.
 */

const geoCache = new Map<string, THREE.BufferGeometry>();
const matCache = new Map<string, THREE.Material>();

function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

export const geo = {
  sphere: (seg = 32) => cached(`sphere:${seg}`, () => new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75))),
  capsule: (r: number, l: number) =>
    cached(`capsule:${r}:${l}`, () => new THREE.CapsuleGeometry(r, l, 8, 20)),
  cylinder: (rt: number, rb: number, h: number, seg = 40, open = false) =>
    cached(`cyl:${rt}:${rb}:${h}:${seg}:${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)),
  torus: (r: number, t: number, arc = Math.PI * 2) =>
    cached(`torus:${r}:${t}:${arc}`, () => new THREE.TorusGeometry(r, t, 14, 40, arc)),
  cone: (r: number, h: number) => cached(`cone:${r}:${h}`, () => new THREE.ConeGeometry(r, h, 36)),
  box: (w: number, h: number, d: number) => cached(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)),
  /** Spherical cap used as a hair shell. */
  cap: (r: number, theta: number) =>
    cached(`cap:${r}:${theta}`, () => new THREE.SphereGeometry(r, 40, 24, 0, Math.PI * 2, 0, theta)),
  /** Ruffled skirt tier: a frustum with a wavy hem. */
  ruffle: (rt: number, rb: number, h: number, waves = 18, amp = 0.018) =>
    cached(`ruffle:${rt}:${rb}:${h}:${waves}`, () => {
      const g = new THREE.CylinderGeometry(rt, rb, h, 96, 4, true);
      const pos = g.attributes.position as THREE.BufferAttribute;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const a = Math.atan2(v.z, v.x);
        const t = (h / 2 - v.y) / h; // 0 at top → 1 at hem
        const k = 1 + Math.sin(a * waves) * amp * t * 6;
        pos.setXYZ(i, v.x * k, v.y, v.z * k);
      }
      g.computeVertexNormals();
      return g;
    }),
};

export type MatOpts = { roughness?: number; metalness?: number; side?: THREE.Side };

/** Matte resin-like material. */
export function resin(color: string, opts: MatOpts = {}): THREE.MeshStandardMaterial {
  const { roughness = 0.62, metalness = 0, side = THREE.FrontSide } = opts;
  const key = `${color}:${roughness}:${metalness}:${side}`;
  let m = matCache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness, side });
    matCache.set(key, m);
  }
  return m;
}

/** The bare, unpainted statuette colour (white resin). */
export const RAW_RESIN = "#f1ede6";
