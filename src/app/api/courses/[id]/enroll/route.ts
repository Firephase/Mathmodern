import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = (session.user as { id?: string }).id!;

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: params.id } },
  });

  if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 400 });

  const enrollment = await prisma.enrollment.create({
    data: { studentId, courseId: params.id },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
