import "server-only";
import { User } from "@/models/User";

function dateStringUTC(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Advances a player's daily play streak — at most once per calendar day
 * (UTC), regardless of how many duels they play that day. Consecutive
 * days increment the streak; a missed day resets it to 1.
 */
export async function updateDailyStreak(userId) {
  const user = await User.findById(userId).select("dailyStreak bestDailyStreak lastStreakDate");
  if (!user) return { streakChanged: false, newStreak: 0 };

  const today = dateStringUTC(new Date());
  if (user.lastStreakDate === today) {
    return { streakChanged: false, newStreak: user.dailyStreak };
  }

  const yesterday = dateStringUTC(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const nextStreak = user.lastStreakDate === yesterday ? user.dailyStreak + 1 : 1;

  user.dailyStreak = nextStreak;
  user.bestDailyStreak = Math.max(user.bestDailyStreak, nextStreak);
  user.lastStreakDate = today;
  await user.save();

  return { streakChanged: true, newStreak: nextStreak };
}

export default updateDailyStreak;