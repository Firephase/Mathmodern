"use client";

import { useState } from "react";
import { LatexRenderer } from "@/components/math/LatexRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Lock } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  type: string;
}

interface LessonListProps {
  lessons: Lesson[];
  isEnrolled: boolean;
  completedIds: string[];
  courseId: string;
}

export function LessonList({ lessons, isEnrolled, completedIds, courseId }: LessonListProps) {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>(completedIds);

  const markComplete = async (lessonId: string) => {
    const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, { method: "POST" });
    if (res.ok) {
      setCompleted(prev => [...prev, lessonId]);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Программа курса</h2>
      {lessons.map((lesson, idx) => {
        const isOpen = openLesson === lesson.id;
        const isDone = completed.includes(lesson.id);
        const isLocked = !isEnrolled && idx > 0;

        return (
          <Card key={lesson.id} className={cn("transition-all", isDone && "border-emerald-200")}>
            <button
              className="w-full px-4 py-3 flex items-center gap-3 text-left"
              onClick={() => !isLocked && setOpenLesson(isOpen ? null : lesson.id)}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : isLocked ? (
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Урок {lesson.order}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {lesson.type === "lecture" ? "Лекция" : lesson.type === "exercise" ? "Задача" : "Игра"}
                  </Badge>
                </div>
                <p className="font-medium text-sm mt-0.5">{lesson.title}</p>
              </div>
              {!isLocked && (
                isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {isOpen && (
              <CardContent className="pt-0 pb-4">
                <div className="rounded-lg bg-muted/30 p-4">
                  <LatexRenderer content={lesson.content} />
                </div>
                {isEnrolled && !isDone && (
                  <Button size="sm" className="mt-3" onClick={() => markComplete(lesson.id)}>
                    Отметить как выполненное
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
