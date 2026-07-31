import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TierBadge } from "@/components/shared/tier-badge";
import { getTierProgress } from "@/lib/tier";

export function RankCard({ rating }) {
  const { tier, nextTier, percent, pointsToNext } = getTierProgress(rating);
  const Icon = tier.icon;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Rank</CardTitle>
        <Icon className="size-4" style={{ color: tier.color }} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <TierBadge rating={rating} showRating={false} />
            <p className="mt-2 text-3xl font-bold">{rating}</p>
          </div>
          {nextTier && (
            <p className="text-right text-xs text-muted-foreground">
              {pointsToNext} pts to <span className="font-medium">{nextTier.label}</span>
            </p>
          )}
        </div>
        <Progress value={percent} />
      </CardContent>
    </Card>
  );
}

export default RankCard;