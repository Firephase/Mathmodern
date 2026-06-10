"use client";

import { useEffect, useRef } from "react";
import type * as ThreeTypes from "three";
import type { SurfaceId } from "./types";

interface Props {
  surface: SurfaceId;
  size?: number;
}

export function Surface3D({ surface, size = 320 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let cleanup: (() => void) | undefined;

    async function init() {
      const THREE = await import("three");
      if (!mountRef.current) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 3.5);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(2, 3, 4);
      scene.add(dir);
      const dir2 = new THREE.DirectionalLight(0x88ffcc, 0.4);
      dir2.position.set(-2, -1, -2);
      scene.add(dir2);

      const mat = new THREE.MeshPhongMaterial({
        color: 0x22c55e,
        shininess: 80,
        side: THREE.DoubleSide,
        wireframe: false,
      });
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x16a34a,
        wireframe: true,
        opacity: 0.15,
        transparent: true,
      });

      let mesh: ThreeTypes.Object3D;

      if (surface === "sphere") {
        const geo = new THREE.SphereGeometry(1, 48, 32);
        mesh = new THREE.Group();
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, mat));
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, wireMat));
      } else if (surface === "torus") {
        const geo = new THREE.TorusGeometry(0.8, 0.34, 24, 64);
        mesh = new THREE.Group();
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, mat));
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, wireMat));
      } else if (surface === "double_torus") {
        // Two tori side by side, approximate genus-2 surface
        const geo = new THREE.TorusGeometry(0.48, 0.22, 20, 48);
        mesh = new THREE.Group();
        const t1 = new THREE.Mesh(geo, mat);
        t1.position.set(-0.58, 0, 0);
        const t1w = new THREE.Mesh(geo, wireMat);
        t1w.position.set(-0.58, 0, 0);
        const t2 = new THREE.Mesh(geo, mat);
        t2.position.set(0.58, 0, 0);
        const t2w = new THREE.Mesh(geo, wireMat);
        t2w.position.set(0.58, 0, 0);
        (mesh as ThreeTypes.Group).add(t1, t1w, t2, t2w);
      } else {
        // Möbius strip — parametric
        const positions: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        const uSegs = 128, vSegs = 20;
        for (let i = 0; i <= uSegs; i++) {
          for (let j = 0; j <= vSegs; j++) {
            const u = (i / uSegs) * 2 * Math.PI;
            const v = (j / vSegs - 0.5) * 0.9;
            const x = (1 + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
            const y = (1 + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
            const z = (v / 2) * Math.sin(u / 2);
            positions.push(x, y, z);
            // Normal (approximate)
            const eps = 0.01;
            const u2 = u + eps;
            const nx = (1 + (v / 2) * Math.cos(u2 / 2)) * Math.cos(u2) - x;
            const ny = (1 + (v / 2) * Math.cos(u2 / 2)) * Math.sin(u2) - y;
            const nz = (v / 2) * Math.sin(u2 / 2) - z;
            const nl = Math.hypot(nx, ny, nz) || 1;
            normals.push(-ny / nl, nx / nl, 0);
          }
        }
        for (let i = 0; i < uSegs; i++) {
          for (let j = 0; j < vSegs; j++) {
            const a = i * (vSegs + 1) + j;
            const b = a + 1;
            const c = (i + 1) * (vSegs + 1) + j;
            const d = c + 1;
            indices.push(a, b, d, a, d, c);
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        mesh = new THREE.Group();
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, mat));
        (mesh as ThreeTypes.Group).add(new THREE.Mesh(geo, wireMat));
        camera.position.set(0, 0, 4);
      }

      scene.add(mesh);

      function animate() {
        animId = requestAnimationFrame(animate);
        mesh.rotation.y += 0.008;
        mesh.rotation.x = Math.sin(Date.now() * 0.0004) * 0.3;
        renderer.render(scene, camera);
      }
      animate();

      cleanup = () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }

    init();
    return () => cleanup?.();
  }, [surface, size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="rounded-xl overflow-hidden"
    />
  );
}
