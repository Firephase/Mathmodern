import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorized, getBotUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return unauthorized();

  const { content, isLatex = false } = await req.json();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  const [bot, target] = await Promise.all([
    getBotUser(),
    prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } }),
  ]);

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Bot acts as mentor in all AI-initiated chats
  const mentorId = bot.id;
  const studentId = target.id;

  const chat = await prisma.chat.upsert({
    where: { mentorId_studentId: { mentorId, studentId } },
    create: { mentorId, studentId },
    update: {},
  });

  const message = await prisma.message.create({
    data: { chatId: chat.id, senderId: bot.id, content, isLatex },
  });

  return NextResponse.json({ chatId: chat.id, messageId: message.id }, { status: 201 });
}
