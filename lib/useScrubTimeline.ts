"use client";

import { RefObject, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A GSAP timeline scrubbed by the scroll position of a (tall, sticky) section.
 * The timeline is normalised to duration 1 so labels map 1:1 to scroll progress.
 */
export function useScrubTimeline(
  section: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      build(tl, gsap.utils.selector(el));
      // pad to exactly 1 so positions are in "progress" units
      if (tl.duration() < 1) tl.to({}, { duration: 1 - tl.duration() });
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
