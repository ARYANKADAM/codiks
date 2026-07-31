import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { seedAchievements } from "@/lib/achievement-service";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await seedAchievements();
  return NextResponse.json({ seeded: keys });
}