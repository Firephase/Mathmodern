import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const [
    totalUsers,
    usersByRole,
    totalCourses,
    publishedCourses,
    coursesByTopic,
    totalEnrollments,
    completedEnrollments,
    avgProgress,
    totalMessages,
    recentUsers,
    topCourses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.course.groupBy({ by: ["topic"], _count: true }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    prisma.enrollment.aggregate({ _avg: { progress: true } }),
    prisma.message.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, role: true, institution: true, createdAt: true },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        topic: true,
        difficulty: true,
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users: {
      total: totalUsers,
      byRole: Object.fromEntries(usersByRole.map(r => [r.role, r._count])),
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      drafts: totalCourses - publishedCourses,
      byTopic: Object.fromEntries(coursesByTopic.map(t => [t.topic, t._count])),
    },
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      avgProgress: Math.round(avgProgress._avg.progress ?? 0),
    },
    messages: { total: totalMessages },
    recentUsers,
    topCourses,
  });
}
