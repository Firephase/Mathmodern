"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, RefreshCw, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameChallenge {
  id: number;
  description: string;
  targetFn: (x: number) => number;
  targetFnLabel: string;
  pointX: number;
  hint: string;
  slopeAnswer: number;
}

const CHALLENGES: GameChallenge[] = [
  {
    id: 1,
    description: "Найди касательную к параболе y = x² в точке x = 1",
    targetFn: (x) => x * x,
    targetFnLabel: "y = x²",
    pointX: 1,
    hint: "Производная x² равна 2x. В точке x=1: f'(1) = ?",
    slopeAnswer: 2,
  },
  {
    id: 2,
    description: "Найди касательную к кубической кривой y = x³ в точке x = 2",
    targetFn: (x) => x * x * x,
    targetFnLabel: "y = x³",
    pointX: 2,
    hint: "Производная x³ равна 3x². В точке x=2: f'(2) = ?",
    slopeAnswer: 12,
  },
  {
    id: 3,
    description: "Найди касательную к y = sin(x) в точке x = 0",
    targetFn: (x) => Math.sin(x),
    targetFnLabel: "y = sin(x)",
    pointX: 0,
    hint: "Производная sin(x) равна cos(x). Чему равен cos(0)?",
    slopeAnswer: 1,
  },
];

export function MathGame({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [slope, setSlope] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "close" | "wrong">("idle");
  const [showAnswer, setShowAnswer] = useState(false);
  const [stars, setStars] = useState<number[]>([]);

  const challenge = CHALLENGES[challengeIdx];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const xMin = -4, xMax = 4, yMin = -3, yMax = 5;

    const toCanvas = (wx: number, wy: number) => ({
      cx: ((wx - xMin) / (xMax - xMin)) * W,
      cy: ((yMax - wy) / (yMax - yMin)) * H,
    });

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let gx = xMin; gx <= xMax; gx++) {
      const { cx } = toCanvas(gx, 0);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    }
    for (let gy = yMin; gy <= yMax; gy++) {
      const { cy } = toCanvas(0, gy);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    }

    // Axes
    const origin = toCanvas(0, 0);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, origin.cy); ctx.lineTo(W, origin.cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.cx, 0); ctx.lineTo(origin.cx, H); ctx.stroke();

    // Target function
    ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    for (let px = 0; px < W; px++) {
      const wx = xMin + (px / W) * (xMax - xMin);
      const wy = challenge.targetFn(wx);
      if (wy > yMax * 2 || wy < yMin * 2) { first = true; continue; }
      const { cx, cy } = toCanvas(wx, wy);
      first ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      first = false;
    }
    ctx.stroke();

    // Target point
    const px0 = challenge.pointX;
    const py0 = challenge.targetFn(px0);
    const ptCanvas = toCanvas(px0, py0);

    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.arc(ptCanvas.cx, ptCanvas.cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ptCanvas.cx, ptCanvas.cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // User's tangent line
    const intercept = py0 - slope * px0;
    const x1 = xMin, y1 = slope * x1 + intercept;
    const x2 = xMax, y2 = slope * x2 + intercept;
    const p1 = toCanvas(x1, y1);
    const p2 = toCanvas(x2, y2);

    const lineColor = feedback === "correct" ? "#10b981" : feedback === "close" ? "#f59e0b" : "#ec4899";
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(p1.cx, p1.cy); ctx.lineTo(p2.cx, p2.cy); ctx.stroke();
    ctx.setLineDash([]);

    // Correct tangent if showing answer
    if (showAnswer) {
      const correctSlope = challenge.slopeAnswer;
      const ci = py0 - correctSlope * px0;
      const cp1 = toCanvas(xMin, correctSlope * xMin + ci);
      const cp2 = toCanvas(xMax, correctSlope * xMax + ci);
      ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cp1.cx, cp1.cy); ctx.lineTo(cp2.cx, cp2.cy); ctx.stroke();
    }

    // Labels
    ctx.fillStyle = "#6366f1";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(challenge.targetFnLabel, 8, 20);

    ctx.fillStyle = lineColor;
    ctx.fillText(`k = ${slope.toFixed(2)}`, 8, 38);
  }, [challenge, slope, feedback, showAnswer]);

  useEffect(() => { draw(); }, [draw]);

  const checkAnswer = () => {
    const diff = Math.abs(slope - challenge.slopeAnswer);
    setAttempts(a => a + 1);
    if (diff < 0.15) {
      setFeedback("correct");
      const earned = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setStars(prev => [...prev, earned]);
      setScore(s => s + earned * 100);
    } else if (diff < 1) {
      setFeedback("close");
    } else {
      setFeedback("wrong");
    }
  };

  const nextChallenge = () => {
    const next = (challengeIdx + 1) % CHALLENGES.length;
    setChallengeIdx(next);
    setSlope(0);
    setFeedback("idle");
    setShowHint(false);
    setShowAnswer(false);
    setAttempts(0);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Охотник за касательными
          </h3>
          <p className="text-xs text-muted-foreground">Задача {challengeIdx + 1}/{CHALLENGES.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-sm">{score} очков</span>
          <div className="flex">
            {stars.map((s, i) => (
              <span key={i} className="text-amber-400">{"★".repeat(s)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Task description */}
      <div className="bg-accent/30 rounded-lg p-3 text-sm">
        {challenge.description}
      </div>

      {/* Canvas */}
      <div className="rounded-xl border overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      </div>

      {/* Slope control */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium">Наклон касательной k = <span className="font-mono text-primary">{slope.toFixed(2)}</span></label>
        </div>
        <input
          type="range"
          min={-15}
          max={15}
          step={0.1}
          value={slope}
          onChange={e => { setSlope(parseFloat(e.target.value)); setFeedback("idle"); }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>−15</span><span>0</span><span>+15</span>
        </div>
      </div>

      {/* Feedback */}
      {feedback !== "idle" && (
        <div className={cn("rounded-lg p-3 text-sm font-medium flex items-center gap-2", {
          "bg-emerald-50 text-emerald-700 border border-emerald-200": feedback === "correct",
          "bg-amber-50 text-amber-700 border border-amber-200": feedback === "close",
          "bg-red-50 text-red-700 border border-red-200": feedback === "wrong",
        })}>
          {feedback === "correct" && <><Trophy className="w-4 h-4" /> Верно! Касательная найдена!</>}
          {feedback === "close" && <><Star className="w-4 h-4" /> Почти! Попробуй ещё немного скорректировать наклон.</>}
          {feedback === "wrong" && <>Не совсем. {showHint ? challenge.hint : "Используй подсказку."}</>}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={checkAnswer} disabled={feedback === "correct"}>
          Проверить
        </Button>
        {feedback === "correct" && (
          <Button onClick={nextChallenge} variant="outline">
            <RefreshCw className="w-4 h-4" />
            Следующая задача
          </Button>
        )}
        {feedback !== "correct" && (
          <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
            Подсказка
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowAnswer(v => !v)}>
          {showAnswer ? "Скрыть ответ" : "Показать ответ"}
        </Button>
      </div>
    </div>
  );
}
