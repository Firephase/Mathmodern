"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LatexEditor } from "@/components/math/LatexEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOPIC_LABELS, DIFFICULTY_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X, BookOpen } from "lucide-react";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    topic: "algebra",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    isOpen: true,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [introLesson, setIntroLesson] = useState({
    title: "",
    content: "",
    enabled: false,
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) { setError("Заполни название и описание"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ошибка"); setLoading(false); return; }

      // If intro lesson enabled, add it
      if (introLesson.enabled && introLesson.title && introLesson.content) {
        await fetch(`/api/courses/${data.id}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: introLesson.title,
            content: introLesson.content,
            order: 1,
            type: "lecture",
          }),
        });
      }

      router.push(`/mentor/courses/${data.id}`);
    } catch {
      setError("Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Создать курс</h1>
          <p className="text-muted-foreground text-sm">Заполни информацию и добавь вводный урок</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle>Основная информация</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Название курса *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Введение в алгебраическую топологию"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Описание *</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание курса, что студент изучит..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Область математики</Label>
                <select
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                >
                  {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Уровень сложности</Label>
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                      className={cn(
                        "flex-1 text-xs py-2 rounded-lg border transition-all",
                        form.difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-input hover:border-primary/50"
                      )}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="топология, алгебра..."
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {tags.map(t => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isOpen"
                checked={form.isOpen}
                onChange={e => setForm(f => ({ ...f, isOpen: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary"
              />
              <Label htmlFor="isOpen" className="cursor-pointer">
                Открытый курс (бесплатный доступ для всех)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Intro lesson */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Вводный урок (необязательно)</CardTitle>
              <input
                type="checkbox"
                checked={introLesson.enabled}
                onChange={e => setIntroLesson(l => ({ ...l, enabled: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
            </div>
          </CardHeader>
          {introLesson.enabled && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Вводный урок покажет студенту суть курса. Используй LaTeX для формул.
              </p>
              <div className="space-y-2">
                <Label>Название урока</Label>
                <Input
                  value={introLesson.title}
                  onChange={e => setIntroLesson(l => ({ ...l, title: e.target.value }))}
                  placeholder="Что такое топологическое пространство?"
                />
              </div>
              <div className="space-y-2">
                <Label>Содержание урока (LaTeX / Markdown)</Label>
                <LatexEditor
                  value={introLesson.content}
                  onChange={v => setIntroLesson(l => ({ ...l, content: v }))}
                  placeholder="# Введение\n\nРассмотрим пространство $X$..."
                  minHeight={250}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} size="lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Создать курс
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
