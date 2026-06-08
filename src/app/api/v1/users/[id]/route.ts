import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      bio: true,
      institution: true,
      country: true,
      createdAt: true,
      updatedAt: true,
      studentProfile: true,
      mentorProfile: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, topic: true } } },
        orderBy: { enrolledAt: "desc" },
      },
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      },
      _count: { select: { sentMessages: true, enrollments: true, coursesCreated: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return unauthorized();

  const body = await req.json();
  const allowed = ["name", "bio", "role", "institution", "country", "avatar"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json(user);
}
