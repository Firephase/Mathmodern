import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "MENTOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(search && {
        OR: [
          { name: { contains: search } },
          { institution: { contains: search } },
          { studentProfile: { interests: { contains: search } } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      institution: true,
      country: true,
      studentProfile: {
        select: {
          mathLevel: true,
          interests: true,
          careerGoal: true,
          xp: true,
          level: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}
