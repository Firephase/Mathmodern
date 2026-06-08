import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = (session.user as { id?: string }).id!;

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: params.id } },
  });

  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const completion = await prisma.lessonCompletion.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: params.lessonId } },
    create: { enrollmentId: enrollment.id, lessonId: params.lessonId },
    update: {},
  });

  // Update progress
  const [totalLessons, completedCount] = await Promise.all([
    prisma.lesson.count({ where: { courseId: params.id } }),
    prisma.lessonCompletion.count({ where: { enrollmentId: enrollment.id } }),
  ]);

  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress } });

  // Award XP
  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { xp: { increment: 25 } },
  });

  return NextResponse.json(completion);
}
