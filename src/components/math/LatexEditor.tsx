"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LatexRenderer } from "./LatexRenderer";
import { Eye, Code2, Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

type ViewMode = "edit" | "preview" | "split";

const SNIPPETS = [
  { label: "Дробь", insert: "\\frac{a}{b}" },
  { label: "Сумма", insert: "\\sum_{i=1}^{n} a_i" },
  { label: "Интеграл", insert: "\\int_{a}^{b} f(x)\\,dx" },
  { label: "Предел", insert: "\\lim_{x \\to \\infty}" },
  { label: "Матрица", insert: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
  { label: "Алфавит", insert: "\\alpha, \\beta, \\gamma, \\delta, \\epsilon" },
  { label: "Бесконечность", insert: "\\infty" },
  { label: "Принадлежность", insert: "\\in, \\notin, \\subset, \\subseteq" },
];

export function LatexEditor({
  value,
  onChange,
  placeholder = "Введите текст. Используйте $...$ для формул и $$...$$ для выключных формул.",
  minHeight = 300,
  className,
}: LatexEditorProps) {
  const [mode, setMode] = useState<ViewMode>("split");

  const insertSnippet = useCallback(
    (snippet: string) => {
      const textarea = document.querySelector<HTMLTextAreaElement>(".latex-editor-textarea");
      if (!textarea) {
        onChange(value + snippet);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + snippet + value.slice(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    },
    [value, onChange]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {SNIPPETS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => insertSnippet(` $${s.insert}$ `)}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors font-mono"
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={mode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("edit")}
          >
            <Code2 className="w-3.5 h-3.5" />
            Код
          </Button>
          <Button
            type="button"
            variant={mode === "split" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("split")}
          >
            <Columns2 className="w-3.5 h-3.5" />
            Сплит
          </Button>
          <Button
            type="button"
            variant={mode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("preview")}
          >
            <Eye className="w-3.5 h-3.5" />
            Просмотр
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div
        className={cn("grid gap-3", {
          "grid-cols-1": mode !== "split",
          "grid-cols-2": mode === "split",
        })}
        style={{ minHeight }}
      >
        {(mode === "edit" || mode === "split") && (
          <div className="relative">
            <Textarea
              className="latex-editor-textarea h-full font-mono text-sm resize-none"
              style={{ minHeight }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
            <Badge variant="outline" className="absolute bottom-2 right-2 text-[10px]">
              LaTeX
            </Badge>
          </div>
        )}

        {(mode === "preview" || mode === "split") && (
          <div
            className="rounded-lg border bg-card p-4 overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <LatexRenderer content={value} />
            ) : (
              <p className="text-muted-foreground text-sm italic">Предпросмотр появится здесь...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
