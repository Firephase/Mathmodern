// Types and surface definitions for the triangulation game
export type SurfaceId = 'sphere' | 'torus' | 'double_torus' | 'mobius';
export type Pt = { x: number; y: number };
export type UserSeg = { a: Pt; b: Pt; id: number };

export const SURFACES: Record<SurfaceId, {
  name: string;
  chi: number;
  description: string;
  polygonWord: string;
  hint: string;
  color: string;
  initV: number;
  initE: number;
  initF: number;
}> = {
  sphere: {
    name: 'Сфера S²',
    chi: 2,
    description: 'Замкнутая ориентируемая поверхность рода 0.',
    polygonWord: 'a a⁻¹',
    hint: 'Разрежьте экватором — получите два диска.',
    color: '#22c55e',
    initV: 1, initE: 0, initF: 1,
  },
  torus: {
    name: 'Тор T²',
    chi: 0,
    description: 'Ориентируемая поверхность рода 1. Поверхность бублика.',
    polygonWord: 'a b a⁻¹ b⁻¹',
    hint: 'Два замкнутых разреза (a и b) раскрывают тор в прямоугольник.',
    color: '#22c55e',
    initV: 1, initE: 2, initF: 1,
  },
  double_torus: {
    name: 'Двойной тор',
    chi: -2,
    description: 'Ориентируемая поверхность рода 2.',
    polygonWord: 'a b a⁻¹ b⁻¹ c d c⁻¹ d⁻¹',
    hint: 'Четыре разреза раскрывают поверхность в восьмиугольник.',
    color: '#22c55e',
    initV: 1, initE: 4, initF: 1,
  },
  mobius: {
    name: 'Лента Мёбиуса',
    chi: 0,
    description: 'Неориентируемая поверхность с одним краем.',
    polygonWord: 'a b a b⁻¹',
    hint: 'Разрезание вдоль средней линии даёт удивительный результат!',
    color: '#22c55e',
    initV: 2, initE: 3, initF: 1,
  },
};

// Fundamental polygon boundary vertices (in 0–1 coordinate space)
export function getBoundaryVerts(surf: SurfaceId): Pt[] {
  switch (surf) {
    case 'sphere': {
      const n = 32;
      return Array.from({ length: n }, (_, i) => ({
        x: 0.5 + 0.42 * Math.cos((i / n) * 2 * Math.PI),
        y: 0.5 + 0.42 * Math.sin((i / n) * 2 * Math.PI),
      }));
    }
    case 'torus':
      return [
        { x: 0.12, y: 0.12 },
        { x: 0.88, y: 0.12 },
        { x: 0.88, y: 0.88 },
        { x: 0.12, y: 0.88 },
      ];
    case 'double_torus': {
      const n = 8;
      return Array.from({ length: n }, (_, i) => ({
        x: 0.5 + 0.41 * Math.cos(-Math.PI / 2 + (i / n) * 2 * Math.PI + Math.PI / n),
        y: 0.5 + 0.41 * Math.sin(-Math.PI / 2 + (i / n) * 2 * Math.PI + Math.PI / n),
      }));
    }
    case 'mobius':
      return [
        { x: 0.08, y: 0.28 },
        { x: 0.92, y: 0.28 },
        { x: 0.92, y: 0.72 },
        { x: 0.08, y: 0.72 },
      ];
  }
}

// Edge identification labels for each boundary edge
export function getEdgeLabels(surf: SurfaceId): { label: string; reversed: boolean }[] {
  switch (surf) {
    case 'sphere':
      return [{ label: 'a', reversed: false }]; // just the circle
    case 'torus':
      return [
        { label: 'a', reversed: false },
        { label: 'b', reversed: false },
        { label: 'a', reversed: true },
        { label: 'b', reversed: true },
      ];
    case 'double_torus':
      return [
        { label: 'a', reversed: false },
        { label: 'b', reversed: false },
        { label: 'a', reversed: true },
        { label: 'b', reversed: true },
        { label: 'c', reversed: false },
        { label: 'd', reversed: false },
        { label: 'c', reversed: true },
        { label: 'd', reversed: true },
      ];
    case 'mobius':
      return [
        { label: 'b', reversed: false },
        { label: 'a', reversed: false },
        { label: 'b', reversed: true },
        { label: 'a', reversed: false }, // same direction as top
      ];
  }
}

// --- Geometry utilities ---

export function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function segIntersection(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
  const dx12 = p2.x - p1.x, dy12 = p2.y - p1.y;
  const dx34 = p4.x - p3.x, dy34 = p4.y - p3.y;
  const denom = dx12 * dy34 - dy12 * dx34;
  if (Math.abs(denom) < 1e-9) return null;
  const dx13 = p3.x - p1.x, dy13 = p3.y - p1.y;
  const t = (dx13 * dy34 - dy13 * dx34) / denom;
  const u = (dx13 * dy12 - dy13 * dx12) / denom;
  if (t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6) {
    return { x: p1.x + t * dx12, y: p1.y + t * dy12 };
  }
  return null;
}

export function ptInPolygon(pt: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if ((yi > pt.y) !== (yj > pt.y) && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function snapTo(pt: Pt, candidates: Pt[], radius: number): Pt | null {
  let best: Pt | null = null;
  let bd = Infinity;
  for (const c of candidates) {
    const d = dist(pt, c);
    if (d < radius && d < bd) { bd = d; best = c; }
  }
  return best;
}

// Colors for user-drawn cuts (must stay in sync with CutCanvas.tsx EDGE_COLORS)
export const EDGE_COLORS_HEX = [
  0xef4444, 0x3b82f6, 0xf59e0b, 0xa855f7,
  0xec4899, 0x14b8a6, 0xf97316, 0x6366f1,
];

// Map a 2-D point (0–1 coords on the fundamental polygon) to 3-D surface coords
export function mapTo3D(pt: Pt, surface: SurfaceId): { x: number; y: number; z: number } {
  switch (surface) {
    case 'torus': {
      // Fundamental rectangle: [0.12, 0.88]² → u,v ∈ [0,1]
      const u = (pt.x - 0.12) / 0.76;
      const v = (pt.y - 0.12) / 0.76;
      const uRad = u * 2 * Math.PI;
      const vRad = v * 2 * Math.PI;
      const R = 0.8, r = 0.34;
      return {
        x: (R + r * Math.cos(vRad)) * Math.cos(uRad),
        y: r * Math.sin(vRad),
        z: (R + r * Math.cos(vRad)) * Math.sin(uRad),
      };
    }
    case 'sphere': {
      // Disk centered at (0.5, 0.5) radius 0.42 → full sphere
      const dx = pt.x - 0.5, dy = pt.y - 0.5;
      const rNorm = Math.min(Math.hypot(dx, dy) / 0.42, 1);
      const lambda = Math.atan2(dy, dx);
      const phi = rNorm * Math.PI;
      return {
        x: Math.sin(phi) * Math.cos(lambda),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(lambda),
      };
    }
    case 'mobius': {
      // Rectangle [0.08, 0.92] × [0.28, 0.72]
      const u = (pt.x - 0.08) / 0.84;
      const v = (pt.y - 0.28) / 0.44;
      const uRad = u * 2 * Math.PI;
      const vScaled = (v - 0.5) * 0.9;
      return {
        x: (1 + (vScaled / 2) * Math.cos(uRad / 2)) * Math.cos(uRad),
        y: (1 + (vScaled / 2) * Math.cos(uRad / 2)) * Math.sin(uRad),
        z: (vScaled / 2) * Math.sin(uRad / 2),
      };
    }
    case 'double_torus': {
      // Octagon ≈ bounding box [0.09, 0.91]². Split x < 0.5 → left torus, x ≥ 0.5 → right torus
      const yMin = 0.09, yMax = 0.91;
      const R = 0.48, r = 0.22;
      if (pt.x < 0.5) {
        const u = (pt.x - 0.09) / 0.41;
        const v = (pt.y - yMin) / (yMax - yMin);
        const uRad = u * 2 * Math.PI, vRad = v * 2 * Math.PI;
        return {
          x: -0.58 + (R + r * Math.cos(vRad)) * Math.cos(uRad),
          y: r * Math.sin(vRad),
          z: (R + r * Math.cos(vRad)) * Math.sin(uRad),
        };
      } else {
        const u = (pt.x - 0.5) / 0.41;
        const v = (pt.y - yMin) / (yMax - yMin);
        const uRad = u * 2 * Math.PI, vRad = v * 2 * Math.PI;
        return {
          x: 0.58 + (R + r * Math.cos(vRad)) * Math.cos(uRad),
          y: r * Math.sin(vRad),
          z: (R + r * Math.cos(vRad)) * Math.sin(uRad),
        };
      }
    }
  }
}

// Lift a 3-D point slightly off the surface to avoid z-fighting
export function liftOff(p: { x: number; y: number; z: number }, surface: SurfaceId) {
  const LIFT = 1.025;
  if (surface === 'double_torus') {
    const cx = p.x < 0 ? -0.58 : 0.58;
    return { x: cx + (p.x - cx) * LIFT, y: p.y * LIFT, z: p.z * LIFT };
  }
  return { x: p.x * LIFT, y: p.y * LIFT, z: p.z * LIFT };
}

// Build planar graph from boundary + user segments, compute V, E, F, χ
export function computeCW(
  boundary: Pt[],
  userSegs: UserSeg[],
  initV: number,
  initE: number,
  initF: number,
  surfChi: number,
) {
  if (userSegs.length === 0) {
    return { V: initV, E: initE, F: initF, chi: surfChi, allVerts: boundary.map((p) => ({ ...p })) };
  }

  // Collect all segments (boundary + user)
  const allSegs: { a: Pt; b: Pt }[] = [];
  for (let i = 0; i < boundary.length; i++) {
    allSegs.push({ a: boundary[i], b: boundary[(i + 1) % boundary.length] });
  }
  for (const s of userSegs) allSegs.push({ a: s.a, b: s.b });

  // Find all intersection points
  const intPts: Pt[] = [];
  for (let i = 0; i < allSegs.length; i++) {
    for (let j = i + 1; j < allSegs.length; j++) {
      const ip = segIntersection(allSegs[i].a, allSegs[i].b, allSegs[j].a, allSegs[j].b);
      if (ip) intPts.push(ip);
    }
  }

  // All raw vertices
  const rawVerts: Pt[] = [
    ...boundary,
    ...userSegs.flatMap((s) => [s.a, s.b]),
    ...intPts,
  ];

  // Deduplicate vertices (epsilon = 0.006 in 0–1 space)
  const EPS = 0.006;
  const verts: Pt[] = [];
  for (const v of rawVerts) {
    if (!verts.find((u) => dist(u, v) < EPS)) verts.push({ ...v });
  }

  // Split all segments at intermediate vertices, collect sub-segments
  const splitSegs: { a: Pt; b: Pt }[] = [];
  for (const seg of allSegs) {
    const dx = seg.b.x - seg.a.x, dy = seg.b.y - seg.a.y;
    const len2 = dx * dx + dy * dy;
    const pts: { t: number; p: Pt }[] = [
      { t: 0, p: seg.a },
      { t: 1, p: seg.b },
    ];
    for (const v of verts) {
      const t = len2 > 1e-12 ? ((v.x - seg.a.x) * dx + (v.y - seg.a.y) * dy) / len2 : -1;
      if (t > 1e-6 && t < 1 - 1e-6) {
        const proj = { x: seg.a.x + t * dx, y: seg.a.y + t * dy };
        if (dist(proj, v) < EPS * 2) pts.push({ t, p: { ...v } });
      }
    }
    pts.sort((a, b) => a.t - b.t);
    for (let i = 0; i < pts.length - 1; i++) {
      if (dist(pts[i].p, pts[i + 1].p) > EPS) {
        splitSegs.push({ a: pts[i].p, b: pts[i + 1].p });
      }
    }
  }

  // Deduplicate edges
  const edges: { a: Pt; b: Pt }[] = [];
  for (const s of splitSegs) {
    if (!edges.find(
      (e) =>
        (dist(e.a, s.a) < EPS && dist(e.b, s.b) < EPS) ||
        (dist(e.a, s.b) < EPS && dist(e.b, s.a) < EPS),
    )) {
      edges.push(s);
    }
  }

  // Connected components (BFS on vertex adjacency)
  const adj: number[][] = Array.from({ length: verts.length }, () => []);
  for (const e of edges) {
    const ai = verts.findIndex((v) => dist(v, e.a) < EPS);
    const bi = verts.findIndex((v) => dist(v, e.b) < EPS);
    if (ai >= 0 && bi >= 0 && ai !== bi) {
      adj[ai].push(bi);
      adj[bi].push(ai);
    }
  }
  const visited = new Set<number>();
  let C = 0;
  for (let i = 0; i < verts.length; i++) {
    if (!visited.has(i)) {
      C++;
      const q = [i];
      while (q.length) {
        const n = q.pop()!;
        if (visited.has(n)) continue;
        visited.add(n);
        for (const nb of adj[n]) if (!visited.has(nb)) q.push(nb);
      }
    }
  }

  const V = verts.length;
  const E = edges.length;
  // Euler formula for planar graph: F = E - V + C + 1
  // But we want INTERIOR faces, not counting the outer infinite face
  const F_euler = E - V + C + 1;
  const F = Math.max(1, F_euler - 1); // interior faces

  // Surface χ adjusted for identifications: since we're working in the polygon,
  // we show the polygon χ and separately show the surface target
  const chi = V - E + F;

  return { V, E, F, chi, allVerts: verts };
}
