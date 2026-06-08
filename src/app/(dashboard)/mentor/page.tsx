import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseJsonField, getInitials, formatDate } from "@/lib/utils";
import { TOPIC_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/types";
import { BookOpen, Users, Plus, ArrowRight, Star, TrendingUp } from "lucide-react";

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;

  const [courses, recentEnrollments, mentorProfile] = await Promise.all([
    prisma.course.findMany({
      where: { mentorId: userId },
      include: {
        _count: { select: { enrollments: true, lessons: true } },
        lessons: { take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { course: { mentorId: userId } },
      include: {
        student: { select: { id: true, name: true, avatar: true, institution: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 8,
    }),
    prisma.mentorProfile.findUnique({ where: { userId } }),
  ]);

  const totalStudents = new Set(recentEnrollments.map(e => e.studentId)).size;
  const specs = parseJsonField<string[]>(mentorProfile?.specializations, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Дашборд ментора</h1>
          <p className="text-muted-foreground mt-1">{session.user?.name}</p>
          <div className="flex gap-2 mt-2">
            {specs.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </div>
        <Link href="/mentor/courses/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать курс
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Курсов", value: courses.length, color: "text-indigo-500", bg: "bg-indigo-50" },
          { icon: Users, label: "Студентов", value: totalStudents, color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Star, label: "Рейтинг", value: mentorProfile?.rating?.toFixed(1) ?? "—", color: "text-amber-500", bg: "bg-amber-50" },
          { icon: TrendingUp, label: "Опубликовано", value: courses.filter(c => c.isPublished).length, color: "text-purple-500", bg: "bg-purple-50" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Мои курсы</h2>
          <Link href="/mentor/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
            Все <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {courses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground mb-3">У вас пока нет курсов</p>
              <Link href="/mentor/courses/create">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать первый курс
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link key={course.id} href={`/mentor/courses/${course.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`${DIFFICULTY_COLORS[course.difficulty]} border-0 text-xs`}>
                        {DIFFICULTY_LABELS[course.difficulty]}
                      </Badge>
                      {course.isPublished ? (
                        <Badge variant="success">Опубликован</Badge>
                      ) : (
                        <Badge variant="secondary">Черновик</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {course._count.enrollments}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> {course._count.lessons} ур.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent students */}
      {recentEnrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Последние студенты</h2>
            <Link href="/mentor/students" className="text-sm text-primary hover:underline">Все</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {recentEnrollments.slice(0, 4).map(e => (
              <Card key={e.id}>
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={e.student.avatar ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(e.student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.course.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(e.enrolledAt)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
