"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FunctionPlotter } from "@/components/math/FunctionPlotter";
import { MathGame } from "@/components/math/MathGame";
import { LatexEditor } from "@/components/math/LatexEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Gamepad2, FileText, Shapes } from "lucide-react";

const TriangulationGame = dynamic(
  () => import("@/components/math/TriangulationGame").then((m) => m.TriangulationGame),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" /> }
);

const TABS = [
  { id: "plotter", label: "Графопостроитель", icon: LineChart },
  { id: "game", label: "Игра: Касательные", icon: Gamepad2 },
  { id: "triangulation", label: "Триангуляция", icon: Shapes },
  { id: "latex", label: "LaTeX редактор", icon: FileText },
];

export function PlaygroundTabs() {
  const [tab, setTab] = useState("plotter");
  const [latexContent, setLatexContent] = useState(`# Моё математическое эссе

Рассмотрим функцию $f(x) = x^2 + \\sin(x)$.

Её производная:
$$f'(x) = 2x + \\cos(x)$$

Критические точки находятся из уравнения $f'(x) = 0$, то есть:
$$2x + \\cos(x) = 0$$

Это **трансцендентное уравнение** и не имеет аналитического решения. Численно: $x \\approx -0.45$`);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plotter" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Интерактивный графопостроитель</CardTitle>
          </CardHeader>
          <CardContent>
            <FunctionPlotter />
          </CardContent>
        </Card>
      )}

      {tab === "game" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Найди касательную к кривой</CardTitle>
          </CardHeader>
          <CardContent>
            <MathGame />
          </CardContent>
        </Card>
      )}

      {tab === "triangulation" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Триангуляция поверхностей</CardTitle>
          </CardHeader>
          <CardContent>
            <TriangulationGame />
          </CardContent>
        </Card>
      )}

      {tab === "latex" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">LaTeX редактор с предпросмотром</CardTitle>
          </CardHeader>
          <CardContent>
            <LatexEditor
              value={latexContent}
              onChange={setLatexContent}
              minHeight={400}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
