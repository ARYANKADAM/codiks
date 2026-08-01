"use client";

import { useState } from "react";
import Link from "next/link";
import { getTierProgress } from "@/lib/tier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODES = {
  math: { label: "Math Rank" },
  cs_quiz: { label: "CS Quiz Rank" },
};

export function GameRankingCard({ mathRating, csQuizRating }) {
  const [mode, setMode] = useState("math");
  const rating = mode === "math" ? mathRating : csQuizRating;
  const { tier, nextTier, percent } = getTierProgress(rating);
  const Icon = tier.icon;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Game Ranking</CardTitle>
        <Link href="/dashboard/leaderboard" className="text-xs font-medium text-primary hover:underline">
          More details →
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="h-10 w-30 rounded-lg border border-input bg-background px-3 text-sm font-medium"
        >
          {Object.entries(MODES).map(([key, m]) => (
            <option key={key} value={key}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="flex flex-col items-center gap-2 py-2">
          <Icon className="size-16" style={{ color: tier.color }} />
          <p className="font-display text-lg uppercase" style={{ color: tier.color }}>
            {tier.label}
          </p>
        </div>

        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: tier.color }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Rank rating</span>
            <span>
              {rating}
              {nextTier ? ` / ${nextTier.min}` : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GameRankingCard;