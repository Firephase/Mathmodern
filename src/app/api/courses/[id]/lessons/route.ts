import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonSchema = z.object({
  title: z.string().min(2),
  content: z.string(),
  order: z.number().int().positive(),
  type: z.enum(["lecture", "exercise", "game", "quiz"]).default("lecture"),
  gameConfig: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mentorId = (session.user as { id?: string }).id;
  if (course.mentorId !== mentorId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const data = lessonSchema.parse(body);

  const lesson = await prisma.lesson.create({ data: { ...data, courseId: params.id } });
  return NextResponse.json(lesson, { status: 201 });
}
