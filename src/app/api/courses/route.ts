import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  topic: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()).default([]),
  isOpen: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");
  const q = searchParams.get("q");

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(topic ? { topic } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(q ? { OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ]} : {}),
    },
    include: {
      mentor: { select: { id: true, name: true, avatar: true, institution: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses.map(c => ({
    ...c,
    tags: JSON.parse(c.tags ?? "[]"),
  })));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = courseSchema.parse(body);
    const mentorId = (session.user as { id?: string }).id!;

    const course = await prisma.course.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        mentorId,
        isPublished: false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
