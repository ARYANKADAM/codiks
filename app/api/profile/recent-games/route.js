import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRecentGamesByMode } from "@/lib/dashboard-service";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = req.nextUrl.searchParams.get("mode") === "math" ? "math" : "cs_quiz";
  const games = await getRecentGamesByMode(userId, mode);
  return NextResponse.json({ games });
}