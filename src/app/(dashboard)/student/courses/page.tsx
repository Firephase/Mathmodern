"use client";

import { useState, useEffect, useCallback } from "react";
import { CourseCard } from "@/components/courses/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";
import { TOPIC_LABELS, DIFFICULTY_LABELS } from "@/types";

interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  tags: string[];
  isOpen: boolean;
  mentor: { id: string; name: string; avatar?: string | null; institution?: string | null };
  _count: { enrollments: number; lessons: number };
}

const TOPICS = Object.entries(TOPIC_LABELS);
const DIFFICULTIES = Object.entries(DIFFICULTY_LABELS);

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);

    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  }, [query, topic, difficulty]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Курсы</h1>
        <p className="text-muted-foreground mt-1">Найди подходящий курс и начни учиться</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по названию или теме..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={topic === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setTopic("")}
          >
            Все темы
          </Button>
          {TOPICS.slice(0, 5).map(([key, label]) => (
            <Button
              key={key}
              variant={topic === key ? "default" : "outline"}
              size="sm"
              onClick={() => setTopic(topic === key ? "" : key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map(([key, label]) => (
            <Button
              key={key}
              variant={difficulty === key ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(difficulty === key ? "" : key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Курсов не найдено</p>
          <p className="text-sm mt-1">Попробуй изменить фильтры</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{courses.length} курсов</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map(c => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <CourseCard key={c.id} course={c as any} href={`/student/courses/${c.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
