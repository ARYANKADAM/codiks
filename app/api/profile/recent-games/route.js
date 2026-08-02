import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRecentGamesByMode } from "@/lib/dashboard-service";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = req.nextUrl.searchParams.get("mode") === "math" ? "math" : "cs_quiz";
  const targetClerkId = req.nextUrl.searchParams.get("clerkId") || userId;
  const games = await getRecentGamesByMode(targetClerkId, mode);
  return NextResponse.json({ games });
}