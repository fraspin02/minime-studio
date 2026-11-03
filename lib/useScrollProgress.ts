"use client";

import { RefObject, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ProgressRef = { current: number };

/**
 * Tracks the scroll progress (0 → 1) of a section into a mutable ref,
 * so 3D scenes can read it every frame without React re-renders.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  { start = "top top", end = "bottom bottom" }: { start?: string; end?: string } = {}
) {
  const progress = useRef<ProgressRef>({ current: 0 });

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        progress.current.current = self.progress;
      },
      onRefresh: (self) => {
        progress.current.current = self.progress;
      },
    });
    return () => st.kill();
  }, [target, start, end]);

  return progress.current;
}
