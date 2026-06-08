"use client";

import { useState } from "react";
import { FunctionPlotter } from "@/components/math/FunctionPlotter";
import { MathGame } from "@/components/math/MathGame";
import { LatexEditor } from "@/components/math/LatexEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Gamepad2, FileText } from "lucide-react";

const TABS = [
  { id: "plotter", label: "Графопостроитель", icon: LineChart },
  { id: "game", label: "Игра: Касательные", icon: Gamepad2 },
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
