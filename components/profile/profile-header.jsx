import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TierBadge } from "@/components/shared/tier-badge";
import { getTierProgress } from "@/lib/tier";
import { Avatar } from "@/components/shared/avatar";

export function ProfileHeader({ username, avatarUrl, rating, stats, memberSince }) {
  const { nextTier, percent, pointsToNext } = getTierProgress(rating);
  const winRate = stats?.totalBattles > 0 ? Math.round((stats.wins / stats.totalBattles) * 100) : 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
       <Avatar src={avatarUrl} alt={username} size="xl" className="ring-4 ring-border" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{username}</h1>
            <TierBadge rating={rating} />
          </div>
          <p className="text-xs text-muted-foreground">
            Member since{" "}
            {memberSince ? new Date(memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
            <span>{stats?.totalBattles ?? 0} battles</span>
            <span>{winRate}% win rate</span>
            <span>Best streak: {stats?.bestWinStreak ?? 0}</span>
          </div>
        </div>
        {nextTier && (
          <div className="w-full sm:w-48">
            <p className="mb-1 text-xs text-muted-foreground">
              {pointsToNext} pts to {nextTier.label}
            </p>
            <Progress value={percent} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileHeader;