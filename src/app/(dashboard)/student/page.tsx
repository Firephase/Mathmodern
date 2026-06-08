import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/CourseCard";
import { BookOpen, FlaskConical, Map, Zap, Trophy, Star, ArrowRight } from "lucide-react";
import { getLevelTitle, parseJsonField, xpForNextLevel } from "@/lib/utils";
import { TOPIC_LABELS } from "@/types";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;

  const [user, enrollments, recommended] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, achievements: { include: { achievement: true } } },
    }),
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            mentor: { select: { id: true, name: true, avatar: true, institution: true } },
            _count: { select: { enrollments: true, lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 4,
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        mentor: { select: { id: true, name: true, avatar: true, institution: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const profile = user?.studentProfile;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpNeeded = xpForNextLevel(level);
  const interests = parseJsonField<string[]>(profile?.interests, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Привет, {session.user?.name?.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {profile?.careerGoal ? `Цель: ${profile.careerGoal}` : "Задай свою карьерную цель в профиле"}
          </p>
        </div>
        <Link href="/student/courses">
          <Button>
            Найти курсы
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* XP & Level */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{getLevelTitle(level)}</p>
                <p className="text-sm text-muted-foreground">Уровень {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-primary">{xp} XP</p>
              <p className="text-xs text-muted-foreground">До следующего: {xpNeeded - xp} XP</p>
            </div>
          </div>
          <Progress value={(xp / xpNeeded) * 100} className="h-2.5" />
          <div className="flex gap-2 mt-4 flex-wrap">
            {user?.achievements.slice(0, 5).map((ua) => (
              <div key={ua.id} title={ua.achievement.title}
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-lg cursor-help">
                {ua.achievement.icon}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/student/courses", icon: BookOpen, label: "Мои курсы", color: "bg-indigo-50 text-indigo-600", count: enrollments.length },
          { href: "/student/playground", icon: FlaskConical, label: "Playground", color: "bg-purple-50 text-purple-600" },
          { href: "/student/conferences", icon: Map, label: "Конференции", color: "bg-amber-50 text-amber-600" },
          { href: "/chat", icon: Zap, label: "Чаты", color: "bg-emerald-50 text-emerald-600" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="font-medium text-sm">{item.label}</p>
                {item.count !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.count} активных</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interests */}
      {interests.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Твои интересы</h2>
          <div className="flex gap-2 flex-wrap">
            {interests.map((t) => (
              <Badge key={t} variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled courses */}
      {enrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Текущие курсы</h2>
            <Link href="/student/courses" className="text-sm text-primary hover:underline">Все курсы</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enrollments.map((e) => (
              <CourseCard
                key={e.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                course={{ ...e.course, tags: parseJsonField<string[]>(e.course.tags, []) } as any}
                progress={e.progress}
                href={`/student/courses/${e.course.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Рекомендовано
          </h2>
          <Link href="/student/courses" className="text-sm text-primary hover:underline">Все</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {recommended.map((c) => (
            <CourseCard
              key={c.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              course={{ ...c, tags: parseJsonField<string[]>(c.tags, []) } as any}
              href={`/student/courses/${c.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
