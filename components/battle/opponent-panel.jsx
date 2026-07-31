import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TierBadge } from "@/components/shared/tier-badge";
import { Avatar } from "@/components/shared/avatar";

export function OpponentPanel({ opponent, isConnected, liveAnswer }) {
  if (!opponent) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Avatar src={opponent.avatarUrl} alt={opponent.username} size="sm" />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card",
            isConnected ? "bg-success" : "bg-muted-foreground"
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{opponent.username}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">{isConnected ? "Online" : "Reconnecting…"}</p>
          <TierBadge rating={opponent.rating} size="sm" showRating={false} />
        </div>
      </div>
      {liveAnswer ? (
        <Badge variant={liveAnswer.status === "accepted" ? "success" : "secondary"} className="ml-auto">
          {liveAnswer.testCasesPassed}/{liveAnswer.testCasesTotal} passed
        </Badge>
      ) : (
        <Badge variant="secondary" className="ml-auto">
          Opponent
        </Badge>
      )}
    </div>
  );
}

export default OpponentPanel;