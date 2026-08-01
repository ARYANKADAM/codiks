// import { currentUser } from "@clerk/nextjs/server";
// import { getDashboardData } from "@/lib/dashboard-service";
// import { getShowcasedAchievements } from "@/lib/achievement-service";
// import { getFriendsData } from "@/lib/friends-service";
// import { ProfileHeader } from "@/components/profile/profile-header";
// import { GameRankingCard } from "@/components/profile/game-ranking-card";
// import { StatsOverviewGrid } from "@/components/profile/stats-overview-grid";
// import { AchievementsGrid } from "@/components/profile/achievements-grid";
// import { GameRatingsRow } from "@/components/profile/game-ratings-row";
// import { RecentGamesList } from "@/components/profile/recent-games-list";

// export const metadata = { title: "Profile" };

// export default async function ProfilePage() {
//   const clerkUser = await currentUser();
//   const data = await getDashboardData(clerkUser.id);
//   const achievements = await getShowcasedAchievements(clerkUser.id);
//   const friendsData = await getFriendsData(clerkUser.id);
//   const profile = data?.profile;

//   return (
//     <div className="grid items-start gap-6 lg:grid-cols-3">
//       {/* Scrollable center column */}
//       <div className="space-y-6 lg:col-span-2">
//         <ProfileHeader
//           username={profile?.username}
//           avatarUrl={clerkUser.imageUrl}
//           bannerUrl={profile?.bannerUrl}
//           memberSince={clerkUser.createdAt}
//           friendsCount={friendsData.friends.length}
//         />
//         <AchievementsGrid achievements={achievements} />
//         <GameRatingsRow mathRating={profile?.mathRating ?? 1200} csQuizRating={profile?.csQuizRating ?? 1200} />
//         <RecentGamesList />
//       </div>

//       {/* Fixed/sticky right rail — stays in view while the left column scrolls */}
//       <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
//         <GameRankingCard mathRating={profile?.mathRating ?? 1200} csQuizRating={profile?.csQuizRating ?? 1200} />
//         <StatsOverviewGrid
//           bestDailyStreak={profile?.bestDailyStreak ?? 0}
//           mathStats={profile?.mathStats}
//           csQuizStats={profile?.csQuizStats}
//           mathRating={profile?.mathRating ?? 1200}
//           csQuizRating={profile?.csQuizRating ?? 1200}
//         />
//       </div>
//     </div>
//   );
// }

import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/dashboard-service";
import { getShowcasedAchievements } from "@/lib/achievement-service";
import { getFriendsData } from "@/lib/friends-service";
import { ProfileHeader } from "@/components/profile/profile-header";
import { GameRankingCard } from "@/components/profile/game-ranking-card";
import { StatsOverviewGrid } from "@/components/profile/stats-overview-grid";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import { GameRatingsRow } from "@/components/profile/game-ratings-row";
import { RecentGamesList } from "@/components/profile/recent-games-list";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
  const achievements = await getShowcasedAchievements(clerkUser.id);
  const friendsData = await getFriendsData(clerkUser.id);

  const profile = data?.profile;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      {/* Left Content */}
      <div className="space-y-6 lg:col-span-2">
        <ProfileHeader
          username={profile?.username}
          avatarUrl={clerkUser.imageUrl}
          bannerUrl={profile?.bannerUrl}
          memberSince={clerkUser.createdAt}
          friendsCount={friendsData.friends.length}
        />

        <AchievementsGrid achievements={achievements} />

        <GameRatingsRow
          mathRating={profile?.mathRating ?? 1200}
          csQuizRating={profile?.csQuizRating ?? 1200}
        />

        <RecentGamesList />
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <GameRankingCard
          mathRating={profile?.mathRating ?? 1200}
          csQuizRating={profile?.csQuizRating ?? 1200}
        />

        <div className="flex-1">
          <StatsOverviewGrid
            bestDailyStreak={profile?.bestDailyStreak ?? 0}
            mathStats={profile?.mathStats}
            csQuizStats={profile?.csQuizStats}
            mathRating={profile?.mathRating ?? 1200}
            csQuizRating={profile?.csQuizRating ?? 1200}
          />
        </div>
      </div>
    </div>
  );
}