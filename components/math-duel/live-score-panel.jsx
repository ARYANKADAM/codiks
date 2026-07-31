import { Avatar } from "@/components/shared/avatar";
import { cn } from "@/lib/utils";

function PlayerScore({ username, avatarUrl, score, isConnected, align }) {
  return (
    <div className={cn("flex items-center gap-3", align === "right" && "flex-row-reverse text-right")}>
      <div className="relative">
        <Avatar src={avatarUrl} alt={username} size="sm" />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card",
            isConnected ? "bg-success" : "bg-muted-foreground"
          )}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{username}</p>
        <p className="font-display text-2xl tabular-nums">{score}</p>
      </div>
    </div>
  );
}

export function LiveScorePanel({ opponent, myScore, opponentScore, opponentConnected }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <PlayerScore username="You" score={myScore} isConnected />
      <span className="font-display text-lg text-muted-foreground">VS</span>
      <PlayerScore
        username={opponent?.username}
        avatarUrl={opponent?.avatarUrl}
        score={opponentScore}
        isConnected={opponentConnected}
        align="right"
      />
    </div>
  );
}

export default LiveScorePanel;