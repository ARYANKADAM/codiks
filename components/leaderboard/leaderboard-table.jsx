import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "@/components/shared/tier-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";

function Row({ entry, isMe }) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0", isMe && "bg-primary/5")}>
      <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">{entry.rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
     <Avatar src={entry.avatarUrl} alt={entry.username} size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {entry.username} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.stats?.wins ?? 0}W – {entry.stats?.losses ?? 0}L
        </p>
      </div>
      <TierBadge rating={entry.rating} size="sm" />
    </div>
  );
}

export function LeaderboardTable({ entries, currentUserClerkId, currentUserEntry }) {
  if (entries.length === 0) {
    return <EmptyState icon={Trophy} title="No ranked players yet" description="Play a battle to be the first on the board." />;
  }

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        {entries.map((entry) => (
          <Row key={entry.clerkId} entry={entry} isMe={entry.clerkId === currentUserClerkId} />
        ))}
        {currentUserEntry && (
          <>
            <div className="border-t-2 border-dashed border-border px-4 py-1 text-center text-xs text-muted-foreground">Your rank</div>
            <Row entry={currentUserEntry} isMe />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default LeaderboardTable;