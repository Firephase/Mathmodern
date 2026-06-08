import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized, getBotUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? undefined;

  const chats = await prisma.chat.findMany({
    where: userId
      ? { OR: [{ mentorId: userId }, { studentId: userId }] }
      : undefined,
    include: {
      mentor: { select: { id: true, name: true, role: true } },
      student: { select: { id: true, name: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(chats);
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized();

  const { userIds, content, isLatex = false } = await req.json();
  if (!Array.isArray(userIds) || !content) {
    return NextResponse.json({ error: "userIds (array) and content are required" }, { status: 400 });
  }

  const bot = await getBotUser();
  const results = [];

  for (const userId of userIds) {
    try {
      const chat = await prisma.chat.upsert({
        where: { mentorId_studentId: { mentorId: bot.id, studentId: userId } },
        create: { mentorId: bot.id, studentId: userId },
        update: {},
      });
      const message = await prisma.message.create({
        data: { chatId: chat.id, senderId: bot.id, content, isLatex },
      });
      results.push({ userId, chatId: chat.id, messageId: message.id, ok: true });
    } catch {
      results.push({ userId, ok: false });
    }
  }

  return NextResponse.json({ sent: results.filter(r => r.ok).length, results }, { status: 201 });
}
