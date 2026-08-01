import "server-only";
import { connectDB } from "@/lib/db";
import { DailyChallengeProgress } from "@/models/DailyChallengeProgress";
import { User } from "@/models/User";
import { DAILY_CHALLENGE_TEMPLATES } from "@/lib/daily-challenges";
import { dateStringUTC } from "@/lib/date-utils";

/**
 * Called once per settled duel (from both math and CS quiz settlement) to
 * bump today's counters. Upserts so the first duel of the day creates the
 * progress document automatically.
 */
export async function recordDuelForDailyChallenges(userId, { mode, won, correctCount = 0 }) {
  await connectDB();
  const today = dateStringUTC(new Date());

  const inc = {
    "counters.total_played": 1,
    "counters.correct_answers": correctCount,
  };
  if (mode === "math") {
    inc["counters.math_played"] = 1;
    if (won) inc["counters.math_wins"] = 1;
  } else if (mode === "cs_quiz") {
    inc["counters.cs_quiz_played"] = 1;
    if (won) inc["counters.cs_quiz_wins"] = 1;
  }

  await DailyChallengeProgress.findOneAndUpdate(
    { user: userId, date: today },
    { $inc: inc, $setOnInsert: { user: userId, date: today } },
    { upsert: true, new: true }
  );
}

/**
 * Loads today's progress and maps it against the challenge catalog.
 * Accepts a Clerk ID (the common case, from API routes/pages).
 */
export async function getDailyChallenges(clerkId) {
  await connectDB();
  const user = await User.findOne({ clerkId }).select("_id");
  if (!user) {
    return { challenges: [], completedCount: 0, totalCount: DAILY_CHALLENGE_TEMPLATES.length };
  }

  const today = dateStringUTC(new Date());
  const progress = await DailyChallengeProgress.findOne({ user: user._id, date: today }).lean();
  const counters = progress?.counters ?? {};

  const challenges = DAILY_CHALLENGE_TEMPLATES.map((t) => {
    const current = counters[t.metric] ?? 0;
    return {
      key: t.key,
      mode: t.mode,
      title: t.title,
      description: t.description,
      current: Math.min(current, t.target),
      target: t.target,
      completed: current >= t.target,
    };
  });

  return {
    challenges,
    completedCount: challenges.filter((c) => c.completed).length,
    totalCount: challenges.length,
  };
}

export default getDailyChallenges;