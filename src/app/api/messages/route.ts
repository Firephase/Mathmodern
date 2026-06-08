import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { chatId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { chatId, content, isLatex = false } = body;
  const senderId = (session.user as { id?: string }).id!;

  const message = await prisma.message.create({
    data: { chatId, content, isLatex, senderId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
