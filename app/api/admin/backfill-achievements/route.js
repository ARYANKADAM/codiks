import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { checkAndUnlockAchievements } from "@/lib/achievement-service";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const users = await User.find({}).select("_id username");

  const results = [];
  for (const user of users) {
    const unlocked = await checkAndUnlockAchievements(user._id);
    results.push({ username: user.username, unlocked: unlocked.map((a) => a.title) });
  }

  return NextResponse.json({ results });
}