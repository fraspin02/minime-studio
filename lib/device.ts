"use client";

import { useEffect, useState } from "react";

let webglCache: boolean | null = null;

/** Detect WebGL support once per session. */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    webglCache = !!gl;
    // Release the probe context right away.
    const ext = (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function isSmallScreen() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/** Device pixel ratio range tuned for performance (phones capped lower). */
export function getDpr(): [number, number] {
  if (typeof window === "undefined") return [1, 1.5];
  return isSmallScreen() || isTouchDevice() ? [1, 1.5] : [1, 2];
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useIsSmall() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const update = () => setSmall(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return small;
}
