import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Achievement } from "@/models/Achievement";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import { createNotification } from "@/lib/notification-service";

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
 * Compares a user's current stats/rating against the achievement catalog
 * and unlocks anything newly earned. Safe to call after every battle —
 * already-unlocked achievements are skipped via the Set lookup below.
 */
export async function checkAndUnlockAchievements(userId) {
  await connectDB();
  const user = await User.findById(userId);
  const catalog = await Achievement.find({});

  const alreadyUnlocked = new Set(user.unlockedAchievements.map((u) => String(u.achievement)));
  const newlyUnlocked = [];

  for (const ach of catalog) {
    if (alreadyUnlocked.has(String(ach._id))) continue;

    const value = ach.criteria.metric === "rating" ? user.rating : user.stats[ach.criteria.metric];
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
      link: "/dashboard/profile",
      metadata: { achievementKey: ach.key, icon: ach.icon },
    });
  }

  return newlyUnlocked;
}

export async function getAchievementsForUser(clerkId) {
  await connectDB();
  const user = await User.findOne({ clerkId }).populate("unlockedAchievements.achievement");
  const catalog = await Achievement.find({}).sort({ "criteria.threshold": 1 });

  const unlockedMap = new Map(
    (user?.unlockedAchievements ?? []).map((u) => [String(u.achievement._id), u.unlockedAt])
  );

  return catalog.map((ach) => ({
    key: ach.key,
    title: ach.title,
    description: ach.description,
    icon: ach.icon,
    unlocked: unlockedMap.has(String(ach._id)),
    unlockedAt: unlockedMap.get(String(ach._id)) ?? null,
  }));
}

export default checkAndUnlockAchievements;