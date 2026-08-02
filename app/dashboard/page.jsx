import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/dashboard-service";
import { StatPills } from "@/components/dashboard/stat-pills";
import { DuelHub } from "@/components/dashboard/duel-hub";
import { DailyChallengesCard } from "@/components/dashboard/daily-challenges-card";
import { DailyQuestPanel } from "@/components/dashboard/daily-quest-panel";
import { InviteFriendsCard } from "@/components/dashboard/invite-friends-card";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { MessagesLinkMobile } from "@/components/layout/messages-link-mobile";
import { UserStoriesRow } from "@/components/dashboard/user-stories-row";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
  const profile = data?.profile;

  const totalDuels = (profile?.mathStats?.totalBattles ?? 0) + (profile?.csQuizStats?.totalBattles ?? 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <StatPills dailyStreak={profile?.dailyStreak ?? 0} totalDuels={totalDuels} />
        <div className="hidden lg:block">
          <NotificationsBell />
        </div>
        <MessagesLinkMobile />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <UserStoriesRow />
          <DuelHub csQuizRating={profile?.csQuizRating ?? 1200} mathRating={profile?.mathRating ?? 1200} />
          <DailyChallengesCard />
        </div>

        <div className="space-y-4">
          <DailyQuestPanel />
          <InviteFriendsCard />
        </div>
      </div>
    </div>
  );
}