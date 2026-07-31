"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { useServerTimeOffset } from "@/hooks/use-server-time";

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function BattleTimer({ battleId, battleState, isCompleted }) {
  const offset = useServerTimeOffset();
  const [now, setNow] = useState(() => Date.now() + offset);
  const hasTriedSettle = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() + offset), 250);
    return () => clearInterval(interval);
  }, [offset]);

  useEffect(() => {
    if (!battleState || isCompleted || hasTriedSettle.current) return;
    if (now >= battleState.endsAt) {
      hasTriedSettle.current = true;
      fetch(`/api/battles/${battleId}/settle`, { method: "POST" }).catch(() => {
        hasTriedSettle.current = false;
      });
    }
  }, [now, battleState, isCompleted, battleId]);

  if (!battleState) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Timer className="size-4" />
        Waiting for opponent…
      </div>
    );
  }

  const { startedAt, endsAt } = battleState;

  if (now < startedAt) {
    return (
      <div className="flex items-center gap-2 text-lg font-bold text-primary">
        <Timer className="size-5" />
        Starting in {Math.ceil((startedAt - now) / 1000)}s
      </div>
    );
  }

  if (now >= endsAt || isCompleted) {
    return (
      <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <Timer className="size-4" />
        {isCompleted ? "Battle over" : "Time's up"}
      </div>
    );
  }

  const remaining = endsAt - now;
  const isLow = remaining < 60_000;

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold tabular-nums ${isLow ? "text-destructive" : "text-foreground"}`}>
      <Timer className="size-5" />
      {formatDuration(remaining)}
    </div>
  );
}

export default BattleTimer;