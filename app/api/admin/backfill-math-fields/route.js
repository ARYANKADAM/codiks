import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const result = await User.updateMany(
    { mathRating: { $exists: false } },
    {
      $set: {
        mathRating: 1200,
        mathStats: { wins: 0, losses: 0, draws: 0, totalBattles: 0, totalQuizzes: 0, winStreak: 0, bestWinStreak: 0 },
      },
    }
  );

  return NextResponse.json({ matched: result.matchedCount, modified: result.modifiedCount });
}