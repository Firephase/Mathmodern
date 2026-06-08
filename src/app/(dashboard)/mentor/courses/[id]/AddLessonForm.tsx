"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LatexEditor } from "@/components/math/LatexEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react";

export function AddLessonForm({ courseId, nextOrder }: { courseId: string; nextOrder: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"lecture" | "exercise">("lecture");

  const submit = async () => {
    if (!title || !content) return;
    setLoading(true);
    await fetch(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, order: nextOrder, type }),
    });
    setTitle(""); setContent(""); setOpen(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <Card className="border-dashed">
      <button
        type="button"
        className="w-full px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <Plus className="w-4 h-4" />
        Добавить урок
        {open ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>
      {open && (
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2">
            <Label>Название урока</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок урока" />
          </div>
          <div className="flex gap-2">
            {(["lecture", "exercise"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${type === t ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
              >
                {t === "lecture" ? "Лекция" : "Задача"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Содержание (LaTeX / Markdown)</Label>
            <LatexEditor value={content} onChange={setContent} minHeight={200} />
          </div>
          <Button onClick={submit} disabled={loading || !title || !content} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Добавить урок {nextOrder}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
