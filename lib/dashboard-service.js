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
    mathStats: user.mathStats,
    csQuizStats: user.csQuizStats,
    dailyStreak: user.dailyStreak ?? 0,
    bestDailyStreak: user.bestDailyStreak ?? 0,
    bannerUrl: user.bannerUrl ?? null,
    csQuizRating: user.csQuizRating ?? 1200,
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
 * Matiks-style "Recent Games" list — both players' scores side by side.
 * Filters by mode via a populate match, then cross-references the
 * opponent's BattleResult for the same battle to get their score too.
 */
export async function getRecentGamesByMode(clerkId, mode, limit = 10) {
  await connectDB();
  const me = await User.findOne({ clerkId }).select("_id username avatarUrl");
  if (!me) return [];

  const myResults = await BattleResult.find({ user: me._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: "battle", match: { mode }, select: "mode endedAt" })
    .lean();

  const filtered = myResults.filter((r) => r.battle);
  const battleIds = filtered.map((r) => r.battle._id);

  const allResults = await BattleResult.find({ battle: { $in: battleIds } })
    .populate("user", "clerkId username avatarUrl")
    .lean();

  const byBattle = new Map();
  for (const r of allResults) {
    const key = String(r.battle);
    if (!byBattle.has(key)) byBattle.set(key, []);
    byBattle.get(key).push(r);
  }

  return filtered.map((r) => {
   const pair = (byBattle.get(String(r.battle._id)) ?? []).filter(
  (result) => result.user
);
   const meResult = pair.find(
  (p) =>
    p.user &&
    String(p.user._id) === String(me._id)
);

const oppResult = pair.find(
  (p) =>
    p.user &&
    String(p.user._id) !== String(me._id)
);

    return {
      battleId: String(r.battle._id),
      mode: r.battle.mode,
      endedAt: r.battle.endedAt,
      me: { score: meResult?.score ?? 0, ratingChange: meResult?.ratingChange ?? 0, username: me.username, avatarUrl: me.avatarUrl },
      opponent: oppResult
  ? {
      score: oppResult.score,
      ratingChange: oppResult.ratingChange,
      username: oppResult.user?.username ?? "Unknown Player",
      avatarUrl: oppResult.user?.avatarUrl ?? null,
    }
  : null,
    };
  });
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