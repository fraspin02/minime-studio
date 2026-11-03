"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Horizontal drag-to-rotate on the canvas with inertia.
 * Vertical swipes are left to the page (touch-action: pan-y), so mobile scroll keeps working.
 * Read `state.current.angle` inside useFrame.
 */
export function useDragRotate({ sensitivity = 0.009, friction = 4, returnHome = false } = {}) {
  const gl = useThree((s) => s.gl);
  const state = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0, lastT: 0, idle: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastT = performance.now();
      s.velocity = 0;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const now = performance.now();
      const dx = e.clientX - s.lastX;
      const dt = Math.max(1, now - s.lastT) / 1000;
      s.angle += dx * sensitivity;
      s.velocity = (dx * sensitivity) / dt;
      s.lastX = e.clientX;
      s.lastT = now;
    };
    const up = () => {
      if (!s.dragging) return;
      s.dragging = false;
      s.idle = 0;
      el.style.cursor = "grab";
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, sensitivity]);

  /** Call once per frame. */
  const update = (dt: number) => {
    const s = state.current;
    if (!s.dragging) {
      s.angle += s.velocity * dt;
      s.velocity *= Math.exp(-friction * dt);
      s.idle += dt;
      if (returnHome && s.idle > 2.2 && Math.abs(s.velocity) < 0.05) {
        const home = Math.round(s.angle / (Math.PI * 2)) * Math.PI * 2;
        s.angle += (home - s.angle) * (1 - Math.exp(-1.6 * dt));
      }
    }
    return s.angle;
  };

  return { state, update };
}
