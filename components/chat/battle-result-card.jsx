"use client";

import { Trophy, Handshake, Sigma, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_LABEL = {
  math: "Math Duel",
  cs_quiz: "CS Quiz Duel",
};

function Metric({ label, value, accent = false }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-background/70 p-3", accent && "bg-primary/10") }>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

export function BattleResultCard({ resultData, currentUserId }) {
  if (!resultData) return null;

  const participants = Array.isArray(resultData.participants) ? resultData.participants : [];
  const me = participants.find((p) => p.clerkId === currentUserId) ?? participants[0];
  const opponent = participants.find((p) => p.clerkId !== currentUserId) ?? participants[1];
  const isDraw = !resultData.winnerClerkId;
  const iWon = !isDraw && resultData.winnerClerkId === currentUserId;
  const badgeLabel = isDraw ? "DRAW" : iWon ? "YOU WON" : "YOU LOST";
  const badgeTone = isDraw ? "bg-secondary text-foreground" : iWon ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground";
  const modeLabel = MODE_LABEL[resultData.mode] ?? "Challenge";
  const modeIcon = resultData.mode === "math" ? Sigma : BrainCircuit;
  const ModeIcon = modeIcon;
  const scoreValue = me?.score ?? me?.questionsSolved ?? me?.correctCount ?? 0;
  const opponentScore = opponent?.score ?? opponent?.questionsSolved ?? opponent?.correctCount ?? 0;
  const ratingDelta = me?.ratingChange ?? 0;

  return (
    <div className="mx-auto w-full max-w-xl rounded-[28px] border border-border bg-card p-4 shadow-[0_16px_60px_rgba(0,0,0,0.3)] sm:p-5">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Async Challenge Result</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
          <ModeIcon className="size-3.5" />
          {modeLabel}
        </span>
      </div>

      <div className="mt-3 rounded-3xl border border-border/80 bg-background/50 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-display uppercase leading-none sm:text-4xl">{badgeLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">vs {opponent?.username ?? "Opponent"}</p>
          </div>
          <div className={cn("flex size-14 items-center justify-center rounded-2xl", isDraw ? "bg-secondary" : iWon ? "bg-primary/15" : "bg-destructive/10")}>
            {isDraw ? (
              <Handshake className="size-7 text-muted-foreground" />
            ) : (
              <Trophy className={cn("size-7", iWon ? "text-primary" : "text-destructive")} />
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Your score" value={scoreValue} accent />
          <Metric label="Opponent score" value={opponentScore} />
          <Metric label="Rating" value={`${ratingDelta > 0 ? "+" : ""}${ratingDelta}`} accent={ratingDelta !== 0} />
          <Metric label="Winner" value={isDraw ? "Draw" : iWon ? "You" : opponent?.username ?? "Opponent"} />
        </div>

        <div className="mt-4 rounded-2xl border border-border/80 bg-card/80 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Battle analytics</span>
            <span className="font-semibold">{resultData.reason === "forfeit" ? "Opponent forfeited" : "Finished"}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Room</p>
              <p className="font-medium">{resultData.roomId ? String(resultData.roomId).slice(-6).toUpperCase() : "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Battle</p>
              <p className="font-medium">{String(resultData.battleId || "").slice(-6).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Result</p>
              <p className="font-medium">{isDraw ? "Draw" : iWon ? "Victory" : "Defeat"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleResultCard;
