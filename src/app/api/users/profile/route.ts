import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const body = await req.json();
  const { name, bio, institution, country, interests, careerGoal } = body;

  await prisma.user.update({
    where: { id: userId },
    data: { name, bio, institution, country },
  });

  await prisma.studentProfile.upsert({
    where: { userId },
    create: { userId, interests: JSON.stringify(interests ?? []), careerGoal },
    update: { interests: JSON.stringify(interests ?? []), careerGoal },
  });

  return NextResponse.json({ ok: true });
}
