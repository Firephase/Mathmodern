import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return unauthorized();

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      mentor: { select: { id: true, name: true, institution: true } },
      lessons: { orderBy: { order: "asc" } },
      enrollments: {
        include: {
          student: { select: { id: true, name: true, institution: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
      _count: { select: { enrollments: true, lessons: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return unauthorized();

  const body = await req.json();
  const allowed = ["title", "description", "isPublished", "isOpen", "topic", "difficulty", "imageUrl"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const course = await prisma.course.update({ where: { id: params.id }, data });
  return NextResponse.json(course);
}
