"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/lib/math";

const vert = /* glsl */ `
  uniform float uP;
  uniform float uTime;
  uniform float uSize;
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = clamp((uP - aRand * 0.3) / 0.7, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 pos = mix(aStart, aEnd, e);
    float arc = sin(e * 3.14159);
    pos += vec3(
      sin(aRand * 41.0 + uTime * 0.8) * 0.9,
      cos(aRand * 23.0) * 0.6 + 0.35,
      cos(aRand * 31.0 + uTime * 0.6) * 0.9
    ) * arc;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + aRand) / -mv.z;
    vColor = aColor;
    vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.82, 1.0, t));
  }
`;

const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

const PALETTE = ["#a58bfa", "#ffe29a", "#f9b8cb", "#7f63e8", "#ffffff", "#e6b48f"];

/**
 * Particles that peel off a photo rectangle and re-assemble into the statuette volume.
 * `progress` (0..1) is read every frame from the given ref.
 */
export function PhotoParticles({
  progress,
  count = 1800,
  from,
  to,
}: {
  progress: { current: number };
  count?: number;
  /** photo rectangle: center + size, in world space */
  from: { center: [number, number, number]; size: [number, number] };
  /** destination volumes (spheres) */
  to: { center: [number, number, number]; radius: [number, number, number] }[];
}) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(11);
    const start = new Float32Array(count * 3);
    const end = new Float32Array(count * 3);
    const color = new Float32Array(count * 3);
    const r = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      start[i * 3] = from.center[0] + (rand() - 0.5) * from.size[0];
      start[i * 3 + 1] = from.center[1] + (rand() - 0.5) * from.size[1];
      start[i * 3 + 2] = from.center[2] + (rand() - 0.5) * 0.04;
      const v = to[Math.floor(rand() * to.length)];
      // random point inside an ellipsoid
      let x = 0,
        y = 0,
        z = 0;
      do {
        x = rand() * 2 - 1;
        y = rand() * 2 - 1;
        z = rand() * 2 - 1;
      } while (x * x + y * y + z * z > 1);
      end[i * 3] = v.center[0] + x * v.radius[0];
      end[i * 3 + 1] = v.center[1] + y * v.radius[1];
      end[i * 3 + 2] = v.center[2] + z * v.radius[2];
      c.set(PALETTE[Math.floor(rand() * PALETTE.length)]);
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
      r[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(r, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 10);
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      uniforms: { uP: { value: 0 }, uTime: { value: 0 }, uSize: { value: 60 } },
    });
    return { geometry: g, material: m };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((state) => {
    material.uniforms.uP.value = progress.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uSize.value = 46 * state.gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
