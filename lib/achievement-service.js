import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Achievement } from "@/models/Achievement";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import { createNotification } from "@/lib/notification-service";

const MAX_SHOWCASED = 8;

export async function seedAchievements() {
  await connectDB();
  const keys = [];
  for (const item of ACHIEVEMENT_CATALOG) {
    const doc = await Achievement.findOneAndUpdate(
      { key: item.key },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    keys.push(doc.key);
  }
  return keys;
}

/**
 * Compares a user's current streak/win totals against the achievement
 * catalog and unlocks anything newly earned. Safe to call after every
 * settled duel — already-unlocked achievements are skipped.
 */
export async function checkAndUnlockAchievements(userId) {
  await connectDB();
  const user = await User.findById(userId);
  const catalog = await Achievement.find({});

  const alreadyUnlocked = new Set(user.unlockedAchievements.map((u) => String(u.achievement)));
  const newlyUnlocked = [];

  const totalWins = (user.mathStats?.wins ?? 0) + (user.csQuizStats?.wins ?? 0);
  const streakValue = user.bestDailyStreak ?? 0;

  for (const ach of catalog) {
    if (alreadyUnlocked.has(String(ach._id))) continue;

    const value = ach.criteria.metric === "dailyStreak" ? streakValue : ach.criteria.metric === "totalWins" ? totalWins : 0;
    if (value >= ach.criteria.threshold) {
      user.unlockedAchievements.push({ achievement: ach._id, unlockedAt: new Date() });
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    await user.save();
  }

  for (const ach of newlyUnlocked) {
    await createNotification({
      userId: user._id,
      clerkId: user.clerkId,
      type: "achievement_unlocked",
      title: "Achievement unlocked!",
      message: ach.title,
      link: "/dashboard/achievements",
      metadata: { achievementKey: ach.key, icon: ach.icon },
    });
  }

  return newlyUnlocked;
}

/**
 * Full catalog with unlocked/showcased status — powers the dedicated
 * /dashboard/achievements page.
 */
export async function getAchievementsForUser(clerkId) {
  await connectDB();
  const user = await User.findOne({ clerkId }).populate("unlockedAchievements.achievement");
  const catalog = await Achievement.find({}).sort({ category: 1, "criteria.threshold": 1 });

  const unlockedMap = new Map(
    (user?.unlockedAchievements ?? [])
      .filter((u) => u.achievement)
      .map((u) => [String(u.achievement._id), u.unlockedAt])
  );
  const showcasedSet = new Set((user?.showcasedAchievements ?? []).map((id) => String(id)));

  return catalog.map((ach) => ({
    id: String(ach._id),
    key: ach.key,
    title: ach.title,
    description: ach.description,
    icon: ach.icon,
    category: ach.category,
    threshold: ach.criteria.threshold,
    unlocked: unlockedMap.has(String(ach._id)),
    unlockedAt: unlockedMap.get(String(ach._id)) ?? null,
    showcased: showcasedSet.has(String(ach._id)),
  }));
}

/**
 * The (up to 8) badges shown on the profile page. Respects the user's
 * manual showcase picks if they've made any; otherwise defaults to their
 * 8 most recently unlocked badges.
 */
export async function getShowcasedAchievements(clerkId) {
  await connectDB();
  const user = await User.findOne({ clerkId })
    .populate("unlockedAchievements.achievement")
    .populate("showcasedAchievements");
  if (!user) return [];

  const unlockedList = user.unlockedAchievements
    .filter((u) => u.achievement)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));

  let selected;
  if (user.showcasedAchievements?.length) {
    const showcasedIds = new Set(user.showcasedAchievements.map((a) => String(a._id)));
    selected = unlockedList.filter((u) => showcasedIds.has(String(u.achievement._id)));
  } else {
    selected = unlockedList.slice(0, MAX_SHOWCASED);
  }

  return selected.slice(0, MAX_SHOWCASED).map((u) => ({
    key: u.achievement.key,
    title: u.achievement.title,
    icon: u.achievement.icon,
  }));
}

export async function setShowcasedAchievements(clerkId, achievementIds) {
  await connectDB();
  if (achievementIds.length > MAX_SHOWCASED) {
    throw new Error(`You can only showcase up to ${MAX_SHOWCASED} badges.`);
  }

  const user = await User.findOne({ clerkId });
  if (!user) throw new Error("Profile not found");

  const unlockedIds = new Set(user.unlockedAchievements.map((u) => String(u.achievement)));
  const allValid = achievementIds.every((id) => unlockedIds.has(String(id)));
  if (!allValid) throw new Error("You can only showcase badges you've unlocked.");

  user.showcasedAchievements = achievementIds;
  await user.save();
}

export default checkAndUnlockAchievements;