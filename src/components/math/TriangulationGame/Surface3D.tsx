"use client";

import { useEffect, useRef } from "react";
import type * as ThreeTypes from "three";
import type { SurfaceId, UserSeg } from "./types";
import { mapTo3D, liftOff, EDGE_COLORS_HEX } from "./types";

interface Props {
  surface: SurfaceId;
  size?: number;
  segs?: UserSeg[];
}

interface SceneHandles {
  scene: ThreeTypes.Scene;
  camera: ThreeTypes.PerspectiveCamera;
  renderer: ThreeTypes.WebGLRenderer;
  cutLines: ThreeTypes.Line[];
}

export function Surface3D({ surface, size = 320, segs = [] }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const handlesRef = useRef<SceneHandles | null>(null);
  const segsRef = useRef<UserSeg[]>(segs);
  const drawLinesRef = useRef<(() => void) | null>(null);

  // Keep segsRef current and trigger redraw
  useEffect(() => {
    segsRef.current = segs;
    drawLinesRef.current?.();
  }, [segs]);

  // Build Three.js scene — reruns only when surface or size changes
  useEffect(() => {
    let animId: number;
    let cleanupFn: (() => void) | undefined;

    async function init() {
      const THREE = await import("three");
      if (!mountRef.current) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

      // Spherical orbit state
      const orbit = {
        theta: 0.5,
        phi: 1.1,
        radius: surface === "mobius" ? 4 : 3.5,
        isDragging: false,
        lastX: 0,
        lastY: 0,
        autoRotate: true,
        resumeTimer: null as ReturnType<typeof setTimeout> | null,
      };

      function applyCamera() {
        camera.position.set(
          orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta),
          orbit.radius * Math.cos(orbit.phi),
          orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
        );
        camera.lookAt(0, 0, 0);
      }
      applyCamera();

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
        const positions: number[] = [], normals: number[] = [], indices: number[] = [];
        const uSegs = 128, vSegs = 20;
        for (let i = 0; i <= uSegs; i++) {
          for (let j = 0; j <= vSegs; j++) {
            const u = (i / uSegs) * 2 * Math.PI;
            const v = (j / vSegs - 0.5) * 0.9;
            const x = (1 + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
            const y = (1 + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
            const z = (v / 2) * Math.sin(u / 2);
            positions.push(x, y, z);
            const eps = 0.01, u2 = u + eps;
            const nx2 = (1 + (v / 2) * Math.cos(u2 / 2)) * Math.cos(u2) - x;
            const ny2 = (1 + (v / 2) * Math.cos(u2 / 2)) * Math.sin(u2) - y;
            const nz2 = (v / 2) * Math.sin(u2 / 2) - z;
            const nl = Math.hypot(nx2, ny2, nz2) || 1;
            normals.push(-ny2 / nl, nx2 / nl, 0);
          }
        }
        for (let i = 0; i < uSegs; i++) {
          for (let j = 0; j < vSegs; j++) {
            const a = i * (vSegs + 1) + j, b = a + 1;
            const c = (i + 1) * (vSegs + 1) + j, d = c + 1;
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
      }

      scene.add(mesh);
      const cutLines: ThreeTypes.Line[] = [];

      // Store handles for segs effect
      handlesRef.current = { scene, camera, renderer, cutLines };

      function drawCutLines() {
        const h = handlesRef.current;
        if (!h) return;
        for (const line of h.cutLines) {
          h.scene.remove(line);
          line.geometry.dispose();
          (line.material as ThreeTypes.Material).dispose();
        }
        h.cutLines.length = 0;

        const currentSegs = segsRef.current;
        for (let i = 0; i < currentSegs.length; i++) {
          const seg = currentSegs[i];
          const color = EDGE_COLORS_HEX[i % EDGE_COLORS_HEX.length];
          const N = 80;
          const points: ThreeTypes.Vector3[] = [];
          for (let t = 0; t <= N; t++) {
            const lerp = t / N;
            const pt2d = {
              x: seg.a.x + (seg.b.x - seg.a.x) * lerp,
              y: seg.a.y + (seg.b.y - seg.a.y) * lerp,
            };
            const p3 = liftOff(mapTo3D(pt2d, surface), surface);
            points.push(new THREE.Vector3(p3.x, p3.y, p3.z));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color, depthTest: true, depthWrite: false });
          const line = new THREE.Line(geo, lineMat);
          line.renderOrder = 1;
          h.scene.add(line);
          h.cutLines.push(line);
        }
      }

      drawLinesRef.current = drawCutLines;
      drawCutLines(); // draw any segs that were set before init

      // Orbit controls
      const canvas = renderer.domElement;

      function onMouseDown(e: MouseEvent) {
        orbit.isDragging = true;
        orbit.lastX = e.clientX;
        orbit.lastY = e.clientY;
        orbit.autoRotate = false;
        if (orbit.resumeTimer) clearTimeout(orbit.resumeTimer);
      }

      function onMouseMove(e: MouseEvent) {
        if (!orbit.isDragging) return;
        const dx = e.clientX - orbit.lastX;
        const dy = e.clientY - orbit.lastY;
        orbit.theta -= dx * 0.012;
        orbit.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbit.phi + dy * 0.012));
        orbit.lastX = e.clientX;
        orbit.lastY = e.clientY;
        applyCamera();
        renderer.render(scene, camera);
      }

      function onMouseUp() {
        orbit.isDragging = false;
        if (orbit.resumeTimer) clearTimeout(orbit.resumeTimer);
        orbit.resumeTimer = setTimeout(() => { orbit.autoRotate = true; }, 2000);
      }

      function onWheel(e: WheelEvent) {
        e.preventDefault();
        orbit.radius = Math.max(1.5, Math.min(8, orbit.radius + e.deltaY * 0.006));
        applyCamera();
        renderer.render(scene, camera);
      }

      canvas.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      function animate() {
        animId = requestAnimationFrame(animate);
        if (orbit.autoRotate && !orbit.isDragging) {
          orbit.theta += 0.008;
          applyCamera();
        }
        renderer.render(scene, camera);
      }
      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        if (orbit.resumeTimer) clearTimeout(orbit.resumeTimer);
        canvas.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("wheel", onWheel);
        renderer.dispose();
        handlesRef.current = null;
        drawLinesRef.current = null;
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }

    init();
    return () => cleanupFn?.();
  }, [surface, size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      title="Перетаскивайте для вращения · колёсико для масштабирования"
    />
  );
}
