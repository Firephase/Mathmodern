import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LatexRenderer } from "@/components/math/LatexRenderer";
import { EnrollButton } from "./EnrollButton";
import { LessonList } from "./LessonList";
import { parseJsonField, getInitials, formatDate } from "@/lib/utils";
import { TOPIC_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/types";
import { Users, BookOpen, Star } from "lucide-react";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { id: params.id },
      include: {
        mentor: {
          select: { id: true, name: true, avatar: true, institution: true, bio: true },
        },
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId: params.id } },
      include: { lessonCompletions: true },
    }),
  ]);

  if (!course) notFound();

  const tags = parseJsonField<string[]>(course.tags, []);
  const isEnrolled = !!enrollment;
  const completedLessons = enrollment?.lessonCompletions.length ?? 0;
  const progress = course.lessons.length > 0 ? Math.round((completedLessons / course.lessons.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex gap-2 mb-3">
          <Badge className={`${DIFFICULTY_COLORS[course.difficulty]} border-0`}>
            {DIFFICULTY_LABELS[course.difficulty]}
          </Badge>
          <Badge variant="outline">{TOPIC_LABELS[course.topic] ?? course.topic}</Badge>
          {course.isOpen && <Badge variant="success">Открытый</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{course.description}</p>

        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {course._count.enrollments} студентов
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> {course.lessons.length} уроков
          </span>
          <span>Создан: {formatDate(course.createdAt)}</span>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Lessons */}
        <div className="md:col-span-2 space-y-4">
          {isEnrolled && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Прогресс курса</span>
                  <span className="text-primary font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {completedLessons} из {course.lessons.length} уроков завершено
                </p>
              </CardContent>
            </Card>
          )}

          <LessonList
            lessons={course.lessons}
            isEnrolled={isEnrolled}
            completedIds={enrollment?.lessonCompletions.map(l => l.lessonId) ?? []}
            courseId={params.id}
          />
        </div>

        {/* Right: Enroll + Mentor */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {isEnrolled ? (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-semibold">Вы записаны!</p>
                  <p className="text-sm text-muted-foreground">Прогресс: {progress}%</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">Начни обучение</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.isOpen ? "Бесплатный открытый курс" : "Курс с ментором"}
                  </p>
                  <EnrollButton courseId={params.id} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Ментор</h3>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.mentor.avatar ?? undefined} />
                  <AvatarFallback>{getInitials(course.mentor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{course.mentor.name}</p>
                  {course.mentor.institution && (
                    <p className="text-xs text-muted-foreground">{course.mentor.institution}</p>
                  )}
                  {course.mentor.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.mentor.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
