"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SurfaceId, UserSeg, SURFACES } from "./types";
import { CutCanvas } from "./CutCanvas";

// Dynamic import for Three.js viewer to avoid SSR issues
const Surface3D = lazy(() =>
  import("./Surface3D").then((m) => ({ default: m.Surface3D }))
);

type Phase = "select" | "view" | "cut" | "win";

const SURFACE_LIST: SurfaceId[] = ["sphere", "torus", "double_torus", "mobius"];

function chiColor(chi: number, target: number) {
  return chi === target ? "text-green-600" : "text-amber-600";
}

export function TriangulationGame() {
  const [phase, setPhase] = useState<Phase>("select");
  const [surface, setSurface] = useState<SurfaceId>("torus");
  const [viewTimer, setViewTimer] = useState(8);
  const [stats, setStats] = useState({ V: 0, E: 0, F: 1, chi: 1 });
  const [segs, setSegs] = useState<UserSeg[]>([]);

  const surf = SURFACES[surface];

  // View phase countdown
  useEffect(() => {
    if (phase !== "view") return;
    if (viewTimer <= 0) { setPhase("cut"); return; }
    const t = setTimeout(() => setViewTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, viewTimer]);

  function selectSurface(id: SurfaceId) {
    setSurface(id);
    setSegs([]);
    setPhase("view");
    setViewTimer(8);
    setStats({ V: SURFACES[id].initV, E: SURFACES[id].initE, F: SURFACES[id].initF, chi: SURFACES[id].chi });
  }

  function restart() {
    setPhase("select");
    setSegs([]);
    setStats({ V: 0, E: 0, F: 1, chi: 1 });
  }

  // ── SELECT SURFACE ──────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Триангуляция поверхностей</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Разрезайте поверхность на многоугольники, следите за <strong>вершинами</strong>,{" "}
            <strong>рёбрами</strong> и <strong>гранями</strong>. Характеристика Эйлера{" "}
            <em>χ&nbsp;=&nbsp;V&nbsp;−&nbsp;E&nbsp;+&nbsp;F</em> всегда остаётся постоянной!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {SURFACE_LIST.map((id) => {
            const s = SURFACES[id];
            return (
              <Card
                key={id}
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                onClick={() => selectSurface(id)}
              >
                <CardContent className="pt-5 pb-4 space-y-3">
                  <Suspense fallback={<div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />}>
                    <div className="flex justify-center">
                      <Surface3D surface={id} size={160} />
                    </div>
                  </Suspense>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    <Badge variant="secondary" className="mt-2 text-xs font-mono">
                      χ = {s.chi}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── VIEW SURFACE ────────────────────────────────────────────
  if (phase === "view") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">{surf.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">{surf.description}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <Badge variant="secondary" className="font-mono">χ = {surf.chi}</Badge>
            <Badge variant="outline" className="font-mono text-xs">{surf.polygonWord}</Badge>
          </div>
        </div>

        <Suspense fallback={<div className="w-80 h-80 bg-muted rounded-xl animate-pulse" />}>
          <Surface3D surface={surface} size={320} />
        </Suspense>

        <p className="text-sm text-muted-foreground italic max-w-sm text-center">
          {surf.hint}
        </p>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Автоматический переход через <strong>{viewTimer}</strong> с
          </div>
          <Button onClick={() => setPhase("cut")}>
            Начать разрезать →
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={restart}>
          ← Выбрать другую поверхность
        </Button>
      </div>
    );
  }

  // ── WIN ─────────────────────────────────────────────────────
  if (phase === "win") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-green-600">Поверхность разрезана!</h2>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Вы разбили <strong>{surf.name}</strong> на многоугольные грани.
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            Эйлерова характеристика осталась постоянной:{" "}
            <span className="font-mono font-bold text-green-600">
              χ = {stats.V} − {stats.E} + {stats.F} = {surf.chi}
            </span>
          </p>
        </div>

        <Card className="w-full max-w-sm">
          <CardContent className="pt-5">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["V", stats.V, "Вершины"],
                ["E", stats.E, "Рёбра"],
                ["F", stats.F, "Грани"],
                ["χ", surf.chi, "Хар-ка Эйлера"],
              ].map(([label, val, desc]) => (
                <div key={String(label)} className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{val}</div>
                  <div className="text-xs font-mono text-muted-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">Что это значит?</p>
          <p>
            Для <strong>{surf.name}</strong> характеристика Эйлера всегда равна{" "}
            <strong>χ = {surf.chi}</strong>. Неважно, как вы разрежете поверхность —
            формула V − E + F всегда даст это число. Это топологический инвариант!
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => { setPhase("cut"); }} variant="outline">
            ← Продолжить резать
          </Button>
          <Button onClick={restart}>
            Выбрать другую поверхность
          </Button>
        </div>
      </div>
    );
  }

  // ── CUT MODE ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">{surf.name}</h2>
          <p className="text-xs text-muted-foreground">{surf.polygonWord}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={restart}>
          ← Сменить поверхность
        </Button>
      </div>

      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        {/* 3D viewer (small, left) */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <Suspense fallback={<div className="w-40 h-40 bg-muted rounded-xl animate-pulse" />}>
            <Surface3D surface={surface} size={160} segs={segs} />
          </Suspense>
          <p className="text-xs text-muted-foreground text-center max-w-[160px]">
            3D-модель · тяните для вращения
          </p>
          <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-center">Обозначение:</p>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {surf.polygonWord}
            </p>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {surf.hint}
            </p>
          </div>
        </div>

        {/* Cut canvas */}
        <div className="flex-1 min-w-0">
          <CutCanvas
            surface={surface}
            segs={segs}
            onSegsChange={setSegs}
            onStatsChange={(V, E, F, chi) => setStats({ V, E, F, chi })}
            onWin={() => setPhase("win")}
          />
        </div>

        {/* Stats panel */}
        <div className="shrink-0 flex flex-col gap-3 min-w-[140px]">
          <p className="text-sm font-semibold text-center">Статистика</p>

          {[
            { label: "V", value: stats.V, desc: "вершины", color: "text-violet-600" },
            { label: "E", value: stats.E, desc: "рёбра", color: "text-blue-600" },
            { label: "F", value: stats.F, desc: "грани", color: "text-orange-600" },
          ].map(({ label, value, desc, color }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-xs font-mono text-muted-foreground">{label}</div>
              <div className="text-[10px] text-muted-foreground">{desc}</div>
            </div>
          ))}

          {/* χ = V - E + F */}
          <div className={`rounded-lg p-3 text-center border-2 ${stats.chi === surf.chi ? "border-green-400 bg-green-50 dark:bg-green-950/30" : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"}`}>
            <div className={`text-3xl font-bold ${stats.chi === surf.chi ? "text-green-600" : "text-amber-600"}`}>
              {stats.chi}
            </div>
            <div className="text-xs font-mono text-muted-foreground">χ = V−E+F</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              цель: <span className="font-semibold">{surf.chi}</span>
            </div>
          </div>

          <div className={`text-xs text-center px-2 py-1.5 rounded-lg ${stats.chi === surf.chi ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
            {stats.chi === surf.chi
              ? "✓ χ совпадает!"
              : `Разрезайте, чтобы\nχ → ${surf.chi}`}
          </div>

          <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Характеристика Эйлера — топологический инвариант. Она не меняется при любых разрезах!
          </div>
        </div>
      </div>
    </div>
  );
}
