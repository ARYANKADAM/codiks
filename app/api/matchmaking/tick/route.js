import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runMatchmakingTick } from "@/lib/matchmaking";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await runMatchmakingTick();
  return NextResponse.json({ matchedCount: rooms.length });
}