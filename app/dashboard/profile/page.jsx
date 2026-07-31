import { currentUser } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { getDashboardData } from "@/lib/dashboard-service";
import { getShowcasedAchievements } from "@/lib/achievement-service";
import { ProfileHeader } from "@/components/profile/profile-header";
import { GameRankingCard } from "@/components/profile/game-ranking-card";
import { StatsOverviewGrid } from "@/components/profile/stats-overview-grid";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import { RecentBattles } from "@/components/dashboard/recent-battles";
import { Skeleton } from "@/components/ui/skeleton";

const RankHistoryFull = dynamic(() => import("@/components/profile/rank-history-full"), {
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
 const achievements = await getShowcasedAchievements(clerkUser.id);
  const profile = data?.profile;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ProfileHeader
          username={profile?.username}
          avatarUrl={clerkUser.imageUrl}
          bannerUrl={profile?.bannerUrl}
          memberSince={clerkUser.createdAt}
        />
        <AchievementsGrid achievements={achievements} />
        <RankHistoryFull data={profile?.ratingHistory ?? []} currentRating={profile?.rating ?? 1200} />
        <RecentBattles battles={data?.recentBattles ?? []} />
      </div>

      <div className="space-y-6">
        <GameRankingCard mathRating={profile?.mathRating ?? 1200} csQuizRating={profile?.csQuizRating ?? 1200} />
        <StatsOverviewGrid
          bestDailyStreak={profile?.bestDailyStreak ?? 0}
          mathStats={profile?.mathStats}
          csQuizStats={profile?.csQuizStats}
          mathRating={profile?.mathRating ?? 1200}
          csQuizRating={profile?.csQuizRating ?? 1200}
        />
      </div>
    </div>
  );
}