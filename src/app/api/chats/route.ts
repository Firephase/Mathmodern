import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string })?.role;
  const { withUserId } = await req.json();

  if (!withUserId) return NextResponse.json({ error: "withUserId required" }, { status: 400 });

  const mentorId = role === "MENTOR" ? userId : withUserId;
  const studentId = role === "MENTOR" ? withUserId : userId;

  const chat = await prisma.chat.upsert({
    where: { mentorId_studentId: { mentorId, studentId } },
    create: { mentorId, studentId },
    update: {},
  });

  return NextResponse.json({ chatId: chat.id });
}
