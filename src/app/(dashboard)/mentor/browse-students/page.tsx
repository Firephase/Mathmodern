"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, parseJsonField } from "@/lib/utils";
import { Search, MessageSquare, GraduationCap } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
  research: "Исследователь",
};

interface Student {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  institution: string | null;
  country: string | null;
  studentProfile: {
    mathLevel: string;
    interests: string;
    careerGoal: string | null;
    xp: number;
    level: number;
  } | null;
}

export default function BrowseStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  const fetchStudents = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/users/students?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    setStudents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchStudents]);

  async function startChat(studentId: string) {
    setStarting(studentId);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withUserId: studentId }),
      });
      const { chatId } = await res.json();
      router.push(`/chat/${chatId}`);
    } finally {
      setStarting(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Найти студента</h1>
        <p className="text-muted-foreground text-sm mt-1">Просматривайте профили студентов и начинайте диалог</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, университету, интересам..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? "Ничего не найдено" : "Студенты пока не зарегистрированы"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {students.map(student => {
            const interests = parseJsonField<string[]>(student.studentProfile?.interests, []);
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4 px-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={student.avatar ?? undefined} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{student.name}</p>
                      {student.institution && (
                        <p className="text-xs text-muted-foreground truncate">{student.institution}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <GraduationCap className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {LEVEL_LABELS[student.studentProfile?.mathLevel ?? ""] ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">· Lvl {student.studentProfile?.level ?? 1}</span>
                      </div>
                    </div>
                  </div>

                  {student.studentProfile?.careerGoal && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {student.studentProfile.careerGoal}
                    </p>
                  )}

                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {interests.slice(0, 4).map(i => (
                        <Badge key={i} variant="secondary" className="text-[11px]">{i}</Badge>
                      ))}
                      {interests.length > 4 && (
                        <Badge variant="outline" className="text-[11px]">+{interests.length - 4}</Badge>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => startChat(student.id)}
                    disabled={starting === student.id}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {starting === student.id ? "Открываем..." : "Написать"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
