"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasProps } from "@react-three/fiber";
import { getDpr, hasWebGL } from "@/lib/device";

// The WebGL runtime (three + R3F + drei) is split into its own chunk and only
// fetched when a scene approaches the viewport.
const StageCanvas = dynamic(() => import("./StageCanvas"), { ssr: false });

type StageProps = Omit<CanvasProps, "children"> & {
  children: ReactNode;
  /** Rendered when WebGL is unavailable (or while far from the viewport). */
  fallback?: ReactNode;
  className?: string;
  /** How early the canvas is mounted before entering the viewport. */
  mountMargin?: string;
  /** Mount immediately (hero). */
  eager?: boolean;
  /** Use the shared studio environment + key light. */
  studio?: boolean;
  /** Expose visibility to callers (e.g. to start intro animations). */
  onVisible?: (v: boolean) => void;
};

/**
 * Lazily-mounted R3F canvas.
 *  - mounts only when near the viewport, unmounts when far (frees the GL context)
 *  - pauses its render loop while offscreen
 *  - falls back to static content without WebGL
 *  - adapts pixel ratio to the device and measured performance
 */
export function Stage({
  children,
  fallback = null,
  className = "",
  mountMargin = "60% 0px",
  eager = false,
  studio = true,
  onVisible,
  camera,
  ...canvasProps
}: StageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [near, setNear] = useState(eager);
  const [visible, setVisible] = useState(eager);
  const [dpr, setDpr] = useState<[number, number] | number>([1, 1.5]);

  useEffect(() => {
    setSupported(hasWebGL());
    setDpr(getDpr());
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(([e]) => setNear(e.isIntersecting || eager), { rootMargin: mountMargin });
    const visObs = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      onVisible?.(e.isIntersecting);
    });
    nearObs.observe(el);
    visObs.observe(el);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, [mountMargin, eager, onVisible]);

  const show3D = supported && near;

  return (
    <div ref={wrap} className={`relative h-full w-full ${className}`}>
      {supported === false && fallback}
      {show3D && (
        <StageCanvas dpr={dpr} setDpr={setDpr} visible={visible} camera={camera} studio={studio} canvasProps={canvasProps}>
          {children}
        </StageCanvas>
      )}
    </div>
  );
}
