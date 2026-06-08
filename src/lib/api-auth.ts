import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export function validateApiKey(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const secret = process.env.API_SECRET_KEY;
  return !!(secret && key === secret);
}

export function unauthorized() {
  return Response.json(
    { error: "Unauthorized", hint: "Provide Authorization: Bearer <API_SECRET_KEY>" },
    { status: 401 }
  );
}

// Returns the bot admin user, creating it on first call
export async function getBotUser() {
  const BOT_EMAIL = "bot@mathmodern.internal";
  let bot = await prisma.user.findUnique({ where: { email: BOT_EMAIL } });
  if (!bot) {
    const bcrypt = await import("bcryptjs");
    bot = await prisma.user.create({
      data: {
        email: BOT_EMAIL,
        name: "MathModern AI",
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
        role: "ADMIN",
        bio: "AI assistant for MathModern platform",
      },
    });
  }
  return bot;
}
