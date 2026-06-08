import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      mentor: { select: { id: true, name: true, avatar: true, institution: true, bio: true, mentorProfile: true } },
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...course, tags: JSON.parse(course.tags ?? "[]") });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mentorId = (session.user as { id?: string }).id;
  if (course.mentorId !== mentorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...body,
      tags: body.tags ? JSON.stringify(body.tags) : undefined,
    },
  });

  return NextResponse.json(updated);
}
