export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map v from [a, b] into [0, 1], clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const smooth = (t: number) => t * t * (3 - 2 * t);

export const easeOutBack = (t: number, s = 1.70158) => {
  const x = t - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Frame-rate independent damping (same curve as THREE.MathUtils.damp). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Deterministic pseudo random generator (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
