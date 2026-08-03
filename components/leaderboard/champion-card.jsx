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
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 sm:rounded-3xl lg:hover:-translate-y-2",
        featured
          ? "border-primary/30 p-5 shadow-[0_0_40px_rgba(124,58,237,.2)] sm:p-6 lg:scale-105 lg:p-8 lg:shadow-[0_0_70px_rgba(124,58,237,.25)]"
          : "p-4 opacity-90 sm:p-5 lg:p-6 lg:hover:opacity-100"
      )}
    >
      {featured && (
        <div className="absolute right-3 top-3 rounded-full bg-primary p-1.5 text-primary-foreground sm:right-5 sm:top-5 sm:p-2">
          <Crown className="size-4 sm:size-5" />
        </div>
      )}

      <div className="flex flex-col items-center">

        <div className="mb-2 text-2xl sm:mb-4 sm:text-4xl">
          {rank === 1 && "🥇"}
          {rank === 2 && "🥈"}
          {rank === 3 && "🥉"}
        </div>

        <Avatar
          src={entry.avatarUrl}
          alt={entry.username}
          size={featured ? "lg" : "md"}
          className="lg:hidden"
        />
        <Avatar
          src={entry.avatarUrl}
          alt={entry.username}
          size={featured ? "xl" : "lg"}
          className="hidden lg:block"
        />

        <h3 className="mt-3 truncate text-center text-base font-bold sm:mt-4 sm:text-xl">

          {entry.username}

        </h3>

        <div className="mt-2 scale-90 sm:mt-3 sm:scale-100">
          <TierBadge rating={entry.rating} />
        </div>

        <div className="mt-3 text-center sm:mt-5">

          <p className="font-display text-2xl text-primary sm:text-3xl lg:text-4xl">

            {entry.rating}

          </p>

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">

            Rating

          </p>

        </div>

        <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:mt-8">

          <div className="rounded-lg bg-secondary p-2 text-center sm:rounded-xl sm:p-3">

            <Flame className="mx-auto mb-1 size-3.5 text-orange-400 sm:size-4" />

            <p className="text-sm font-bold sm:text-base">

              {entry.stats?.bestWinStreak ?? 0}

            </p>

            <p className="text-[10px] text-muted-foreground sm:text-xs">

              Streak

            </p>

          </div>

          <div className="rounded-lg bg-secondary p-2 text-center sm:rounded-xl sm:p-3">

            <Trophy className="mx-auto mb-1 size-3.5 text-yellow-400 sm:size-4" />

            <p className="text-sm font-bold sm:text-base">

              {entry.stats?.wins ?? 0}

            </p>

            <p className="text-[10px] text-muted-foreground sm:text-xs">

              Wins

            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ChampionCard;