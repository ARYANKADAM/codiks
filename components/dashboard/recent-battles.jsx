import { Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

function ResultBadge({ placement }) {
  if (placement === 1) return <Badge variant="success">Won</Badge>;
  if (placement == null) return <Badge variant="secondary">Draw</Badge>;
  return <Badge variant="destructive">Lost</Badge>;
}

export function RecentBattles({ battles }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent battles</CardTitle>
      </CardHeader>
      <CardContent>
        {battles.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="No battles yet"
            description="Your match history will show up here once you play your first duel."
          />
        ) : (
          <ul className="divide-y divide-border">
            {battles.map((battle) => (
              <li key={battle.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <ResultBadge placement={battle.placement} />
                  <div>
                    <p className="text-sm font-medium">vs {battle.opponent?.username ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {battle.questionsSolved}/{battle.totalQuestions} solved
                      {battle.endedAt && ` · ${new Date(battle.endedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    battle.ratingChange > 0
                      ? "text-sm font-semibold text-success"
                      : battle.ratingChange < 0
                      ? "text-sm font-semibold text-destructive"
                      : "text-sm font-semibold text-muted-foreground"
                  }
                >
                  {battle.ratingChange > 0 ? "+" : ""}
                  {battle.ratingChange}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentBattles;