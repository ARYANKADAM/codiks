"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/shared/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Swords } from "lucide-react";

const TABS = [
  { key: "math", label: "Math" },
  { key: "cs_quiz", label: "CS Quiz" },
];

function GameRow({ game }) {
  const meWon = game.me.score > (game.opponent?.score ?? 0);
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-1 text-[10px] uppercase text-muted-foreground">
        {new Date(game.endedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar src={game.me.avatarUrl} alt={game.me.username} size="sm" />
          <div>
            <p className={`text-sm font-semibold ${meWon ? "text-success" : ""}`}>{game.me.username}</p>
            <p className="text-[10px] text-muted-foreground">
              {game.me.ratingChange > 0 ? "+" : ""}
              {game.me.ratingChange}
            </p>
          </div>
        </div>
        <p className={`text-lg font-bold ${meWon ? "text-success" : ""}`}>{game.me.score}</p>
      </div>
      {game.opponent && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={game.opponent.avatarUrl} alt={game.opponent.username} size="sm" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{game.opponent.username}</p>
              <p className="text-[10px] text-muted-foreground">
                {game.opponent.ratingChange > 0 ? "+" : ""}
                {game.opponent.ratingChange}
              </p>
            </div>
          </div>
          <p className="text-lg font-bold text-muted-foreground">{game.opponent.score}</p>
        </div>
      )}
    </div>
  );
}

export function RecentGamesList() {
  const [tab, setTab] = useState("math");
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/profile/recent-games?mode=${tab}`)
      .then((r) => r.json())
      .then((d) => setGames(d.games ?? []))
      .finally(() => setIsLoading(false));
  }, [tab]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Games</CardTitle>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : games.length === 0 ? (
          <EmptyState icon={Swords} title="No games yet" description="Play a duel to see it here." className="border-none p-6" />
        ) : (
          games.map((g) => <GameRow key={g.battleId} game={g} />)
        )}
      </CardContent>
    </Card>
  );
}

export default RecentGamesList;