"use client";

import { ReactNode, Suspense } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { getDpr } from "@/lib/device";

type Props = {
  children: ReactNode;
  dpr: [number, number] | number;
  setDpr: (d: [number, number] | number) => void;
  visible: boolean;
  studio: boolean;
  camera: CanvasProps["camera"];
  canvasProps: Omit<CanvasProps, "children" | "camera">;
};

export default function StageCanvas({ children, dpr, setDpr, visible, studio, camera, canvasProps }: Props) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={visible ? "always" : "never"}
      camera={camera ?? { position: [0, 1.2, 7], fov: 30, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      {...canvasProps}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(getDpr())}
        flipflops={3}
      />
      {studio && <StudioLights />}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

/**
 * Photographic studio lighting built procedurally (no HDR download):
 * a soft key, a cool rim and a warm bounce, reflected by a light-former environment.
 */
export function StudioLights({ warm = "#fff4e6", rim = "#e6dcff" }: { warm?: string; rim?: string }) {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#eadfce", 0.9]} />
      <directionalLight position={[3, 6, 5]} intensity={1.9} color={warm} />
      <directionalLight position={[-5, 3, -4]} intensity={1.1} color={rim} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 5, 3]} scale={[8, 3, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={1.4} color="#fff1dc" position={[-5, 1.5, 2]} scale={[3, 5, 1]} rotation-y={Math.PI / 2.5} />
        <Lightformer form="rect" intensity={1.2} color="#e9e1ff" position={[5, 1.5, -1]} scale={[3, 5, 1]} rotation-y={-Math.PI / 2.5} />
        <Lightformer form="circle" intensity={0.8} color="#ffe29a" position={[0, -3, 4]} scale={4} />
      </Environment>
    </>
  );
}
