import { FunctionPlotter } from "@/components/math/FunctionPlotter";
import { MathGame } from "@/components/math/MathGame";
import { LatexEditor } from "@/components/math/LatexEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaygroundTabs } from "./PlaygroundTabs";

export default function PlaygroundPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Math Playground
          <Badge variant="purple">интерактив</Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
          Строй графики, решай задачи, пиши LaTeX — всё в одном месте
        </p>
      </div>

      <PlaygroundTabs />
    </div>
  );
}
