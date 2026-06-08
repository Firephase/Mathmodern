import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") ?? undefined;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const skip = (page - 1) * limit;

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { institution: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    NOT: { email: "bot@mathmodern.internal" },
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        institution: true,
        country: true,
        createdAt: true,
        studentProfile: { select: { mathLevel: true, xp: true, level: true } },
        mentorProfile: { select: { rating: true, isVerified: true } },
        _count: { select: { enrollments: true, sentMessages: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data: users, total, page, pages: Math.ceil(total / limit) });
}
