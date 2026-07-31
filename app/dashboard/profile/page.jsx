import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/dashboard-service";
import { ProfileHeader } from "@/components/profile/profile-header";
import { RecentBattles } from "@/components/dashboard/recent-battles";
import { getAchievementsForUser } from "@/lib/achievement-service";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RankHistoryFull = dynamic(() => import("@/components/profile/rank-history-full"), {
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
  const achievements = await getAchievementsForUser(clerkUser.id);

  return (
    <div className="space-y-6">
      <ProfileHeader
        username={data?.profile.username}
        avatarUrl={clerkUser.imageUrl}
        rating={data?.profile.rating ?? 1200}
        stats={data?.profile.stats}
        memberSince={clerkUser.createdAt}
      />
      <RankHistoryFull data={data?.profile.ratingHistory ?? []} currentRating={data?.profile.rating ?? 1200} />
      <AchievementsGrid achievements={achievements} />
      <RecentBattles battles={data?.recentBattles ?? []} />
    </div>
  );
}