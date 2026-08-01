import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDailyChallenges } from "@/lib/daily-challenge-service";
import { msUntilNextUTCMidnight } from "@/lib/date-utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getDailyChallenges(userId);
  return NextResponse.json({ ...data, resetsInMs: msUntilNextUTCMidnight() });
}