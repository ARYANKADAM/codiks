"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_LABEL = { math: "Math Duel", cs_quiz: "CS Quiz Duel" };

export function BattleResultCard({ resultData, currentUserId }) {
  if (!resultData) return null;

  const participants = Array.isArray(resultData.participants) ? resultData.participants : [];
  const me = participants.find((p) => p.clerkId === currentUserId) ?? participants[0];
  const isDraw = !resultData.winnerClerkId;
  const iWon = !isDraw && resultData.winnerClerkId === currentUserId;
  const badgeLabel = isDraw ? "DRAW" : iWon ? "YOU WON" : "YOU LOST";
  const modeLabel = MODE_LABEL[resultData.mode] ?? "Challenge";

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-border/70 bg-secondary/20 p-4 sm:max-w-sm sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Async Challenge Result</span>
        <ChevronRight className="size-4" />
      </div>

      <div className="relative mt-3 flex items-center justify-center rounded-xl border border-border/70 bg-background/40 py-6">
        <span
          className={cn(
            "font-display text-4xl uppercase tracking-tight sm:text-5xl",
            isDraw ? "text-muted-foreground" : iWon ? "text-primary" : "text-destructive"
          )}
        >
          {badgeLabel}
        </span>
        <span
          className={cn(
            "absolute -rotate-6 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
            isDraw ? "bg-secondary text-foreground" : iWon ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
          )}
        >
          {modeLabel}
        </span>
      </div>
    </div>
  );
}

export default BattleResultCard;