import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { BattleResult } from "@/models/BattleResult";

function serializeUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
    rating: user.rating,
    stats: user.stats,
    mathRating: user.mathRating ?? 1200,
    ratingHistory: (user.ratingHistory ?? []).map((entry) => ({
      rating: entry.rating,
      recordedAt: new Date(entry.recordedAt).toISOString(),
    })),
  };
}

function serializeBattleResult(result) {
  const battle = result.battle;
  const opponent = battle?.participants?.find(
    (p) => String(p.user?._id ?? p.user) !== String(result.user)
  );

  return {
    id: String(result._id),
    mode: battle?.mode ?? "1v1",
    endedAt: battle?.endedAt ? new Date(battle.endedAt).toISOString() : null,
    score: result.score,
    questionsSolved: result.questionsSolved,
    totalQuestions: result.totalQuestions,
    ratingChange: result.ratingChange,
    placement: result.placement,
    opponent: opponent?.user
      ? { username: opponent.user.username, avatarUrl: opponent.user.avatarUrl }
      : null,
  };
}

/**
 * Request-deduped profile fetch. Both the dashboard layout (navbar badge)
 * and the dashboard page (full stats) call this — cache() ensures the
 * underlying query only runs once per request.
 */
export const getUserProfile = cache(async function getUserProfile(clerkId) {
  await connectDB();
  const user = await User.findOne({ clerkId }).lean();
  return user ? serializeUser(user) : null;
});

/**
 * Assembles everything the dashboard overview page needs. Kept out of the
 * page component so an API route can reuse it later (e.g. client-side
 * refetch after a battle ends) without duplicating query logic.
 */
export async function getDashboardData(clerkId) {
  const profile = await getUserProfile(clerkId);
  if (!profile) return null;

  const recentResults = await BattleResult.find({ user: profile.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: "battle",
      select: "mode endedAt participants",
      populate: { path: "participants.user", select: "username avatarUrl" },
    })
    .lean();

  return {
    profile,
    recentBattles: recentResults.map(serializeBattleResult),
  };
}

export default getDashboardData;