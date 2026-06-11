"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SurfaceId, Pt, UserSeg,
  getBoundaryVerts, getEdgeLabels,
  ptInPolygon, snapTo, dist, computeCW, SURFACES,
} from "./types";

const CANVAS_SIZE = 440;
const SNAP_R = 0.025; // in 0–1 space

// Convert 0–1 coords to canvas coords
function toC(p: Pt): Pt {
  return { x: p.x * CANVAS_SIZE, y: p.y * CANVAS_SIZE };
}
// Convert canvas coords to 0–1 space
function fromC(p: Pt): Pt {
  return { x: p.x / CANVAS_SIZE, y: p.y / CANVAS_SIZE };
}

const EDGE_COLORS = [
  "#ef4444", "#3b82f6", "#f59e0b", "#a855f7",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

interface Props {
  surface: SurfaceId;
  segs: UserSeg[];
  onSegsChange: (segs: UserSeg[]) => void;
  onStatsChange: (v: number, e: number, f: number, chi: number) => void;
  onWin: () => void;
}

export function CutCanvas({ surface, segs, onSegsChange, onStatsChange, onWin }: Props) {
  const [drawing, setDrawing] = useState<Pt | null>(null); // start of current edge
  const [hovered, setHovered] = useState<Pt | null>(null);
  const [mode, setMode] = useState<"vertex" | "edge">("edge");
  const [extraVerts, setExtraVerts] = useState<Pt[]>([]); // user-placed standalone vertices
  const nextId = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const boundary = getBoundaryVerts(surface);
  const edgeLabels = getEdgeLabels(surface);
  const surf = SURFACES[surface];

  // All vertices available for snapping
  const allSnappable: Pt[] = [
    ...boundary,
    ...extraVerts,
    ...segs.flatMap((s) => [s.a, s.b]),
  ];

  // Recompute CW-complex whenever segs change
  useEffect(() => {
    const allUserSegs = [...segs];
    // Add extraVerts as degenerate (length-0) contributions: they only add to V
    const result = computeCW(
      boundary,
      allUserSegs,
      surf.initV,
      surf.initE,
      surf.initF,
      surf.chi,
    );
    onStatsChange(result.V, result.E, result.F, result.chi);

    // Win condition: χ equals surface χ AND user has made at least 1 cut
    // AND the number of faces is ≥ 2 (at least one face cut into pieces)
    if (segs.length >= 1 && result.F >= 2 && result.chi === surf.chi) {
      onWin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segs, surface]);

  const getSvgPos = useCallback((e: React.MouseEvent<SVGSVGElement>): Pt => {
    const rect = svgRef.current!.getBoundingClientRect();
    return fromC({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSvgPos(e);
    const snapped = snapTo(pt, allSnappable, SNAP_R);
    setHovered(snapped ?? (ptInPolygon(pt, boundary) ? pt : null));
  }, [getSvgPos, allSnappable, boundary]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const raw = getSvgPos(e);
    const snapped = snapTo(raw, allSnappable, SNAP_R);
    const pt = snapped ?? raw;

    if (!ptInPolygon(pt, boundary) && !snapped) return;

    if (mode === "vertex") {
      if (!snapped) setExtraVerts((v) => [...v, pt]);
      return;
    }

    // Edge mode
    if (!drawing) {
      setDrawing(pt);
    } else {
      // Don't allow zero-length edges
      if (dist(drawing, pt) < 0.01) { setDrawing(null); return; }
      onSegsChange([...segs, { a: drawing, b: pt, id: nextId.current++ }]);
      setDrawing(null);
    }
  }, [getSvgPos, allSnappable, boundary, mode, drawing]);

  const handleRightClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    setDrawing(null);
  }, []);

  const undo = () => {
    if (drawing) { setDrawing(null); return; }
    onSegsChange(segs.slice(0, -1));
  };

  const reset = () => {
    onSegsChange([]);
    setExtraVerts([]);
    setDrawing(null);
  };

  // Build boundary polygon path
  const polyPath = boundary.map((p, i) => {
    const { x, y } = toC(p);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ") + " Z";

  // Edge label midpoints
  const labelPositions = boundary.map((p, i) => {
    const next = boundary[(i + 1) % boundary.length];
    const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
    // Offset slightly outward from polygon center (0.5, 0.5)
    const cx = 0.5, cy = 0.5;
    const dx = mid.x - cx, dy = mid.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: mid.x + (dx / len) * 0.055, y: mid.y + (dy / len) * 0.055 };
  });

  // Hovered cursor point in canvas space
  const cursorC = hovered ? toC(hovered) : null;
  const drawingC = drawing ? toC(drawing) : null;

  // Only show one label per unique letter-direction pair for sphere (too many segments)
  const showAllLabels = surface !== "sphere";

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Инструмент:</span>
        <button
          onClick={() => { setMode("edge"); setDrawing(null); }}
          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${mode === "edge" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
        >
          ✂️ Ножницы (разрез)
        </button>
        <button
          onClick={() => { setMode("vertex"); setDrawing(null); }}
          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${mode === "vertex" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
        >
          · Вершина
        </button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={undo} disabled={segs.length === 0 && !drawing}>
            ↩ Отмена
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} disabled={segs.length === 0 && extraVerts.length === 0}>
            🗑 Очистить
          </Button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        {drawing && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 text-amber-800 text-xs px-2 py-0.5 rounded z-10">
            Начало разреза выбрано — кликните в конечную точку
          </div>
        )}
        <svg
          ref={svgRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="cursor-crosshair border rounded-xl bg-slate-50 dark:bg-slate-900"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          onClick={handleClick}
          onContextMenu={handleRightClick}
        >
          {/* Fundamental domain fill */}
          <path d={polyPath} fill="#dcfce7" stroke="none" opacity="0.6" />

          {/* Grid hint (faint) */}
          {[...Array(8)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={(i + 1) * CANVAS_SIZE / 9} y1={0} x2={(i + 1) * CANVAS_SIZE / 9} y2={CANVAS_SIZE} stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1={0} y1={(i + 1) * CANVAS_SIZE / 9} x2={CANVAS_SIZE} y2={(i + 1) * CANVAS_SIZE / 9} stroke="#e2e8f0" strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Boundary polygon */}
          <path
            d={polyPath}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Edge labels */}
          {showAllLabels && labelPositions.map((lp, i) => {
            const label = edgeLabels[i % edgeLabels.length];
            const { x, y } = toC(lp);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="600"
                fill={label.reversed ? "#dc2626" : "#2563eb"}
                className="select-none pointer-events-none"
              >
                {label.reversed ? label.label + "⁻¹" : label.label}
              </text>
            );
          })}
          {!showAllLabels && (
            <text
              x={CANVAS_SIZE / 2}
              y={CANVAS_SIZE * 0.06}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#2563eb"
              className="select-none pointer-events-none"
            >
              a
            </text>
          )}

          {/* Arrow indicators on boundary edges (for identification direction) */}
          {surface !== "sphere" && boundary.map((p, i) => {
            const next = boundary[(i + 1) % boundary.length];
            const mid = toC({ x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 });
            const from = toC(p), to = toC(next);
            const label = edgeLabels[i % edgeLabels.length];
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowAngle = label.reversed ? angle + Math.PI : angle;
            const ax = mid.x + 10 * Math.cos(arrowAngle);
            const ay = mid.y + 10 * Math.sin(arrowAngle);
            return (
              <polygon
                key={i}
                points={`${ax},${ay} ${ax - 8 * Math.cos(arrowAngle - 0.4)},${ay - 8 * Math.sin(arrowAngle - 0.4)} ${ax - 8 * Math.cos(arrowAngle + 0.4)},${ay - 8 * Math.sin(arrowAngle + 0.4)}`}
                fill={label.reversed ? "#dc2626" : "#2563eb"}
                opacity={0.6}
                className="pointer-events-none"
              />
            );
          })}

          {/* Boundary corner vertices */}
          {boundary.map((p, i) => {
            const { x, y } = toC(p);
            return <circle key={i} cx={x} cy={y} r={4} fill="#16a34a" stroke="#fff" strokeWidth="1.5" className="pointer-events-none" />;
          })}

          {/* User-placed standalone vertices */}
          {extraVerts.map((v, i) => {
            const { x, y } = toC(v);
            return <circle key={`ev${i}`} cx={x} cy={y} r={5} fill="#7c3aed" stroke="#fff" strokeWidth="1.5" className="pointer-events-none" />;
          })}

          {/* User segments */}
          {segs.map((s, i) => {
            const a = toC(s.a), b = toC(s.b);
            const color = EDGE_COLORS[i % EDGE_COLORS.length];
            return (
              <g key={s.id} className="pointer-events-none">
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={a.x} cy={a.y} r={4.5} fill={color} stroke="#fff" strokeWidth="1.5" />
                <circle cx={b.x} cy={b.y} r={4.5} fill={color} stroke="#fff" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* In-progress edge */}
          {drawing && cursorC && drawingC && (
            <line
              x1={drawingC.x}
              y1={drawingC.y}
              x2={cursorC.x}
              y2={cursorC.y}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6 3"
              strokeLinecap="round"
              className="pointer-events-none"
            />
          )}

          {/* Drawing start point */}
          {drawing && drawingC && (
            <circle cx={drawingC.x} cy={drawingC.y} r={6} fill="#f59e0b" stroke="#fff" strokeWidth="2" className="pointer-events-none" />
          )}

          {/* Cursor / snap indicator */}
          {hovered && cursorC && !drawing && (
            <circle cx={cursorC.x} cy={cursorC.y} r={5} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" className="pointer-events-none" />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
        <span><span className="text-blue-600 font-semibold">Синий</span> = ребро a</span>
        <span><span className="text-red-600 font-semibold">Красный</span> = ребро a⁻¹ (обратное)</span>
        <span>Цветные линии = ваши разрезы</span>
        <span>ПКМ / Esc = отмена</span>
      </div>
    </div>
  );
}
