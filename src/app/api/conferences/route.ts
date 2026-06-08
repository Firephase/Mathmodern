import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const field = searchParams.get("field");
  const tier = searchParams.get("tier");

  const conferences = await prisma.conference.findMany({
    where: {
      ...(field ? { field } : {}),
      ...(tier ? { tier } : {}),
    },
    orderBy: [{ isTop: "desc" }, { startDate: "asc" }],
  });

  return NextResponse.json(conferences);
}
