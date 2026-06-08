import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PublishButton } from "./PublishButton";
import { AddLessonForm } from "./AddLessonForm";
import { parseJsonField, getInitials, formatDate } from "@/lib/utils";
import { TOPIC_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/types";
import { Users, BookOpen, Plus } from "lucide-react";

export default async function MentorCourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      enrollments: {
        include: {
          student: { select: { id: true, name: true, avatar: true, institution: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!course || course.mentorId !== userId) notFound();

  const tags = parseJsonField<string[]>(course.tags, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex gap-2 mb-2">
            <Badge className={`${DIFFICULTY_COLORS[course.difficulty]} border-0`}>
              {DIFFICULTY_LABELS[course.difficulty]}
            </Badge>
            <Badge variant="outline">{TOPIC_LABELS[course.topic] ?? course.topic}</Badge>
            {course.isPublished ? (
              <Badge variant="success">Опубликован</Badge>
            ) : (
              <Badge variant="warning">Черновик</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.description}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        </div>
        <PublishButton courseId={params.id} isPublished={course.isPublished} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Студентов", value: course.enrollments.length },
          { icon: BookOpen, label: "Уроков", value: course.lessons.length },
          { icon: BookOpen, label: "Создан", value: formatDate(course.createdAt) },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <s.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lessons */}
        <div>
          <h2 className="font-semibold mb-3">Уроки</h2>
          <div className="space-y-2 mb-4">
            {course.lessons.map(l => (
              <Card key={l.id}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5">{l.order}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{l.title}</p>
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      {l.type === "lecture" ? "Лекция" : l.type === "exercise" ? "Задача" : "Игра"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <AddLessonForm courseId={params.id} nextOrder={course.lessons.length + 1} />
        </div>

        {/* Students */}
        <div>
          <h2 className="font-semibold mb-3">Студенты ({course.enrollments.length})</h2>
          {course.enrollments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Пока нет студентов
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {course.enrollments.map(e => (
                <Card key={e.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={e.student.avatar ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(e.student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.student.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={e.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{e.progress}%</span>
                      </div>
                    </div>
                    <Link href={`/chat?with=${e.studentId}`}>
                      <Button size="sm" variant="ghost" className="text-xs">Чат</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
