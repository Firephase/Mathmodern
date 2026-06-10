import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") ?? undefined;
  const publishedParam = searchParams.get("published");
  const search = searchParams.get("search") ?? "";

  const courses = await prisma.course.findMany({
    where: {
      ...(topic && { topic }),
      ...(publishedParam !== null && { isPublished: publishedParam === "true" }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    },
    include: {
      mentor: { select: { id: true, name: true, institution: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}
