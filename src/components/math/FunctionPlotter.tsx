"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

interface PlotFunction {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
  error?: string;
}

interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function evalFunction(expr: string, x: number): number | null {
  try {
    // Replace math functions
    let sanitized = expr
      .replace(/\^/g, "**")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/abs/g, "Math.abs")
      .replace(/ln/g, "Math.log")
      .replace(/log/g, "Math.log10")
      .replace(/exp/g, "Math.exp")
      .replace(/pi/g, "Math.PI")
      .replace(/e(?![a-zA-Z])/g, "Math.E");

    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `"use strict"; return (${sanitized});`);
    const result = fn(x);
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

export function FunctionPlotter({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<PlotFunction[]>([
    { id: "1", expr: "x^2", color: COLORS[0], visible: true },
    { id: "2", expr: "sin(x)", color: COLORS[1], visible: true },
  ]);
  const [newExpr, setNewExpr] = useState("");
  const [view, setView] = useState<ViewBox>({ xMin: -8, xMax: 8, yMin: -5, yMax: 5 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; view: ViewBox } | null>(null);

  const worldToCanvas = useCallback(
    (wx: number, wy: number, width: number, height: number) => {
      const cx = ((wx - view.xMin) / (view.xMax - view.xMin)) * width;
      const cy = ((view.yMax - wy) / (view.yMax - view.yMin)) * height;
      return { cx, cy };
    },
    [view]
  );

  const canvasToWorld = useCallback(
    (cx: number, cy: number, width: number, height: number) => {
      const wx = view.xMin + (cx / width) * (view.xMax - view.xMin);
      const wy = view.yMax - (cy / height) * (view.yMax - view.yMin);
      return { wx, wy };
    },
    [view]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;

    const xStep = getNiceStep((view.xMax - view.xMin) / 10);
    const yStep = getNiceStep((view.yMax - view.yMin) / 10);

    for (let gx = Math.ceil(view.xMin / xStep) * xStep; gx <= view.xMax; gx += xStep) {
      const { cx } = worldToCanvas(gx, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
    }
    for (let gy = Math.ceil(view.yMin / yStep) * yStep; gy <= view.yMax; gy += yStep) {
      const { cy } = worldToCanvas(0, gy, width, height);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
    }

    // Axes
    const origin = worldToCanvas(0, 0, width, height);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;

    // X axis
    ctx.beginPath();
    ctx.moveTo(0, origin.cy);
    ctx.lineTo(width, origin.cy);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(origin.cx, 0);
    ctx.lineTo(origin.cx, height);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.textAlign = "center";

    for (let gx = Math.ceil(view.xMin / xStep) * xStep; gx <= view.xMax; gx += xStep) {
      if (Math.abs(gx) < xStep * 0.01) continue;
      const { cx, cy } = worldToCanvas(gx, 0, width, height);
      const labelY = Math.min(Math.max(cy + 16, 16), height - 4);
      ctx.fillText(String(Math.round(gx * 100) / 100), cx, labelY);
    }
    ctx.textAlign = "right";
    for (let gy = Math.ceil(view.yMin / yStep) * yStep; gy <= view.yMax; gy += yStep) {
      if (Math.abs(gy) < yStep * 0.01) continue;
      const { cx, cy } = worldToCanvas(0, gy, width, height);
      const labelX = Math.min(Math.max(cx - 6, 4), width - 4);
      ctx.fillText(String(Math.round(gy * 100) / 100), labelX, cy + 4);
    }

    // Plot functions
    const steps = width * 2;
    functions.forEach((fn) => {
      if (!fn.visible || fn.error) return;

      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let first = true;

      for (let i = 0; i <= steps; i++) {
        const wx = view.xMin + (i / steps) * (view.xMax - view.xMin);
        const wy = evalFunction(fn.expr, wx);

        if (wy === null || wy > view.yMax * 3 || wy < view.yMin * 3) {
          first = true;
          continue;
        }

        const { cx, cy } = worldToCanvas(wx, wy, width, height);
        if (first) {
          ctx.moveTo(cx, cy);
          first = false;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    });

    // Hover crosshair
    if (hoveredPoint) {
      const { cx, cy } = worldToCanvas(hoveredPoint.x, hoveredPoint.y, width, height);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [functions, view, worldToCanvas, hoveredPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    draw();
    return () => resizeObserver.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const addFunction = () => {
    if (!newExpr.trim()) return;
    const color = COLORS[functions.length % COLORS.length];
    const testVal = evalFunction(newExpr, 1);
    setFunctions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        expr: newExpr.trim(),
        color,
        visible: true,
        error: testVal === null && newExpr.trim() ? "Ошибка" : undefined,
      },
    ]);
    setNewExpr("");
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const zoom = (factor: number) => {
    const cx = (view.xMin + view.xMax) / 2;
    const cy = (view.yMin + view.yMax) / 2;
    const xr = ((view.xMax - view.xMin) / 2) * factor;
    const yr = ((view.yMax - view.yMin) / 2) * factor;
    setView({ xMin: cx - xr, xMax: cx + xr, yMin: cy - yr, yMax: cy + yr });
  };

  const resetView = () => setView({ xMin: -8, xMax: 8, yMin: -5, yMax: 5 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 1.15 : 0.87);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging && dragStart.current) {
      const dx = ((mx - dragStart.current.mouseX) / rect.width) * (dragStart.current.view.xMax - dragStart.current.view.xMin);
      const dy = ((my - dragStart.current.mouseY) / rect.height) * (dragStart.current.view.yMax - dragStart.current.view.yMin);
      setView({
        xMin: dragStart.current.view.xMin - dx,
        xMax: dragStart.current.view.xMax - dx,
        yMin: dragStart.current.view.yMin + dy,
        yMax: dragStart.current.view.yMax + dy,
      });
      return;
    }

    const { wx, wy } = canvasToWorld(mx, my, rect.width, rect.height);
    setHoveredPoint({ x: wx, y: wy });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
      view: { ...view },
    };
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Function list */}
      <div className="flex flex-col gap-2">
        {functions.map((fn) => (
          <div key={fn.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: fn.color }} />
            <code className="flex-1 text-sm font-mono bg-muted px-3 py-1 rounded-md truncate">
              y = {fn.expr}
            </code>
            {fn.error && <Badge variant="destructive" className="text-xs">Ошибка</Badge>}
            <button
              onClick={() => setFunctions(prev => prev.map(f => f.id === fn.id ? { ...f, visible: !f.visible } : f))}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {fn.visible ? "●" : "○"}
            </button>
            <button onClick={() => removeFunction(fn.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <span className="text-sm font-mono text-muted-foreground self-center">y =</span>
          <Input
            value={newExpr}
            onChange={(e) => setNewExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFunction()}
            placeholder="x^2, sin(x), x^3-2*x..."
            className="font-mono text-sm"
          />
          <Button onClick={addFunction} size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl border overflow-hidden bg-slate-50" style={{ aspectRatio: "16/9" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ display: "block" }}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={() => { setIsDragging(false); dragStart.current = null; }}
          onMouseLeave={() => { setHoveredPoint(null); setIsDragging(false); }}
        />

        {/* Coordinates display */}
        {hoveredPoint && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-mono px-2 py-1 rounded border shadow-sm">
            x = {hoveredPoint.x.toFixed(3)}, y = {hoveredPoint.y.toFixed(3)}
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button size="icon" variant="outline" className="h-7 w-7 bg-white/90" onClick={() => zoom(0.7)}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7 bg-white/90" onClick={() => zoom(1.4)}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7 bg-white/90" onClick={resetView}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Прокрутка — масштаб · Перетаскивание — перемещение · Поддерживаются: sin, cos, tan, sqrt, ln, log, exp, pi, e
      </p>
    </div>
  );
}

function getNiceStep(roughStep: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const norm = roughStep / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}
