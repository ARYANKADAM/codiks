import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { BattleResult } from "@/models/BattleResult";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const users = await User.find({});
  const fixed = [];

  for (const user of users) {
    const results = await BattleResult.find({ user: user._id }).sort({ createdAt: 1 });

    let rating = 1200;
    let wins = 0, losses = 0, draws = 0, winStreak = 0, bestWinStreak = 0;
    const ratingHistory = [];

    for (const r of results) {
      rating += r.ratingChange;
      if (r.placement === 1) {
        wins += 1;
        winStreak += 1;
        bestWinStreak = Math.max(bestWinStreak, winStreak);
      } else if (r.placement === 2) {
        losses += 1;
        winStreak = 0;
      } else {
        draws += 1;
        winStreak = 0;
      }
      ratingHistory.push({ rating, recordedAt: r.createdAt });
    }

    user.rating = rating;
    user.stats.totalBattles = results.length;
    user.stats.wins = wins;
    user.stats.losses = losses;
    user.stats.draws = draws;
    user.stats.winStreak = winStreak;
    user.stats.bestWinStreak = bestWinStreak;
    user.ratingHistory = ratingHistory;
    await user.save();

    fixed.push({ username: user.username, rating, totalBattles: results.length });
  }

  return NextResponse.json({ fixed });
}