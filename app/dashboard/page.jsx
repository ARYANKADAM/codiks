import { currentUser } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { Swords, Trophy, Target, Flame } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatPills } from "@/components/dashboard/stat-pills";
import { DuelModeTabs } from "@/components/dashboard/duel-mode-tabs";
import { QuickMatchCta } from "@/components/dashboard/quick-match-cta";
import { RankCard } from "@/components/dashboard/rank-card";
import { RecentBattles } from "@/components/dashboard/recent-battles";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { DuelHub } from "@/components/dashboard/duel-hub";

const RatingChart = dynamic(() => import("@/components/dashboard/rating-chart"), {
  loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
});

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);

  const stats = data?.profile.stats ?? { wins: 0, losses: 0, totalBattles: 0, winStreak: 0 };
  const rating = data?.profile.rating ?? 1200;
  const winRate = stats.totalBattles > 0 ? Math.round((stats.wins / stats.totalBattles) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-3xl uppercase">Arena</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {clerkUser.firstName || data?.profile.username}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatPills rating={rating} winStreak={stats.winStreak} totalBattles={stats.totalBattles} />
          <NotificationsBell />
        </div>
      </div>

      <DuelHub rating={rating} mathRating={data?.profile.mathRating ?? 1200} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Swords} label="Total battles" value={stats.totalBattles} />
        <StatCard icon={Trophy} label="Wins" value={stats.wins} accent="success" />
        <StatCard icon={Target} label="Win rate" value={`${winRate}%`} accent="accent" />
        <StatCard icon={Flame} label="Win streak" value={stats.winStreak} accent="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RatingChart data={data?.profile.ratingHistory ?? []} />
        </div>
        <RankCard rating={rating} />
      </div>

      <RecentBattles battles={data?.recentBattles ?? []} />
    </div>
  );
}