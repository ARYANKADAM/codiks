import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { setShowcasedAchievements } from "@/lib/achievement-service";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { achievementIds } = await req.json();

  try {
    await setShowcasedAchievements(userId, achievementIds ?? []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}