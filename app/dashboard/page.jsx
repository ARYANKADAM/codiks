import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/dashboard-service";
import { StatPills } from "@/components/dashboard/stat-pills";
import { DuelHub } from "@/components/dashboard/duel-hub";
import { NotificationsBell } from "@/components/layout/notifications-bell";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
  const profile = data?.profile;

  const totalDuels = (profile?.mathStats?.totalBattles ?? 0) + (profile?.csQuizStats?.totalBattles ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-3xl uppercase">Arena</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {clerkUser.firstName || profile?.username}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatPills dailyStreak={profile?.dailyStreak ?? 0} totalDuels={totalDuels} />
          <NotificationsBell />
        </div>
      </div>

      <DuelHub csQuizRating={profile?.csQuizRating ?? 1200} mathRating={profile?.mathRating ?? 1200} />
    </div>
  );
}