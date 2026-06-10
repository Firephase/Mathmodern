import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      ...(search && {
        OR: [
          { name: { contains: search } },
          { bio: { contains: search } },
          { institution: { contains: search } },
          { mentorProfile: { specializations: { contains: search } } },
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
      mentorProfile: {
        select: {
          specializations: true,
          rating: true,
          reviewsCount: true,
          isVerified: true,
        },
      },
      _count: { select: { coursesCreated: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(mentors);
}
