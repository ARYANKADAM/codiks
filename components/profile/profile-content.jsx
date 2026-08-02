import { ProfileHeaderCard } from "@/components/profile/profile-header-card";
import { GameRankingCard } from "@/components/profile/game-ranking-card";
import { StatsOverviewGrid } from "@/components/profile/stats-overview-grid";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import { GameRatingsRow } from "@/components/profile/game-ratings-row";
import { RecentGamesList } from "@/components/profile/recent-games-list";

export function ProfileContent({
  targetClerkId,
  isOwner,
  username,
  avatarUrl,
  bannerUrl,
  memberSince,
  profile,
  achievements,
  friendsCount,
  friendStatus,
  requestId,
}) {
  return (
    <div className="grid gap-6 lg:h-[calc(100vh-2rem)] lg:grid-cols-3 lg:overflow-hidden">
      {/* Left Content */}
      <div className="space-y-6 lg:col-span-2 lg:h-full lg:overflow-y-auto lg:pr-2 scrollbar-hide">
        <ProfileHeaderCard
          isOwner={isOwner}
          targetClerkId={targetClerkId}
          username={username}
          avatarUrl={avatarUrl}
          bannerUrl={bannerUrl}
          memberSince={memberSince}
          friendsCount={friendsCount}
          friendStatus={friendStatus}
          requestId={requestId}
        />

        <AchievementsGrid achievements={achievements} />

        <GameRatingsRow
          mathRating={profile?.mathRating ?? 1200}
          csQuizRating={profile?.csQuizRating ?? 1200}
        />

        <RecentGamesList clerkId={isOwner ? undefined : targetClerkId} />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 lg:h-full lg:overflow-y-auto scrollbar-hide">
        <GameRankingCard
          mathRating={profile?.mathRating ?? 1200}
          csQuizRating={profile?.csQuizRating ?? 1200}
        />

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

export default ProfileContent;