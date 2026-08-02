"use client";

import { Crown, Flame, Trophy } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { TierBadge } from "@/components/shared/tier-badge";
import { cn } from "@/lib/utils";

export function ChampionCard({
  entry,
  rank,
  featured = false,
}) {
  if (!entry) return null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-2",
        featured
          ? "scale-105 border-primary/30 p-8 shadow-[0_0_70px_rgba(124,58,237,.25)]"
          : "p-6 opacity-90 hover:opacity-100"
      )}
    >
      {featured && (
        <div className="absolute right-5 top-5 rounded-full bg-primary p-2 text-primary-foreground">
          <Crown className="size-5" />
        </div>
      )}

      <div className="flex flex-col items-center">

        <div className="mb-4 text-4xl">
          {rank === 1 && "🥇"}
          {rank === 2 && "🥈"}
          {rank === 3 && "🥉"}
        </div>

        <Avatar
          src={entry.avatarUrl}
          alt={entry.username}
          size={featured ? "xl" : "lg"}
        />

        <h3 className="mt-4 text-xl font-bold">

          {entry.username}

        </h3>

        <div className="mt-3">
          <TierBadge rating={entry.rating} />
        </div>

        <div className="mt-5 text-center">

          <p className="text-4xl font-display text-primary">

            {entry.rating}

          </p>

          <p className="text-xs uppercase tracking-widest text-muted-foreground">

            Rating

          </p>

        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-3">

          <div className="rounded-xl bg-secondary p-3 text-center">

            <Flame className="mx-auto mb-1 size-4 text-orange-400" />

            <p className="font-bold">

              {entry.stats?.bestWinStreak ?? 0}

            </p>

            <p className="text-xs text-muted-foreground">

              Streak

            </p>

          </div>

          <div className="rounded-xl bg-secondary p-3 text-center">

            <Trophy className="mx-auto mb-1 size-4 text-yellow-400" />

            <p className="font-bold">

              {entry.stats?.wins ?? 0}

            </p>

            <p className="text-xs text-muted-foreground">

              Wins

            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ChampionCard;