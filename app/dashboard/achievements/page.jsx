import { auth } from "@clerk/nextjs/server";
import { getAchievementsForUser } from "@/lib/achievement-service";
import { AchievementsPageClient } from "@/components/achievements/achievements-page-client";

export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const { userId } = await auth();
  const achievements = await getAchievementsForUser(userId);

  return <AchievementsPageClient initialAchievements={achievements} />;
}