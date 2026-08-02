"use client";

import { ChevronRight, Flame } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { TierBadge } from "@/components/shared/tier-badge";
import { cn } from "@/lib/utils";

export function LeaderboardRow({
  entry,
  isMe,
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-5 rounded-2xl border border-border bg-card px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(124,58,237,.15)]",
        isMe && "border-primary bg-primary/5"
      )}
    >
      {/* Rank */}

      <div className="w-12 text-center">

        <p className="text-2xl font-display text-primary">

          #{entry.rank}

        </p>

      </div>

      {/* Avatar */}

      <Avatar
        src={entry.avatarUrl}
        alt={entry.username}
        size="md"
      />

      {/* Name */}

      <div className="min-w-0 flex-1">

        <h3 className="truncate font-semibold">

          {entry.username}

          {isMe && (
            <span className="ml-2 text-xs text-primary">

              YOU

            </span>
          )}

        </h3>

        <p className="text-sm text-muted-foreground">

          {entry.stats?.wins ?? 0} Wins • {entry.stats?.losses ?? 0} Losses

        </p>

      </div>

      {/* Rating */}

      <div className="hidden w-28 text-center md:block">

        <p className="font-display text-2xl">

          {entry.rating}

        </p>

        <p className="text-xs text-muted-foreground">

          Rating

        </p>

      </div>

      {/* Streak */}

      <div className="hidden w-24 items-center justify-center gap-2 lg:flex">

        <Flame className="text-orange-400" />

        <span>

          {entry.stats?.bestWinStreak ?? 0}

        </span>

      </div>

      {/* Tier */}

      <div className="w-36">

        <TierBadge rating={entry.rating} />

      </div>

      <ChevronRight className="text-muted-foreground transition group-hover:translate-x-1" />

    </div>
  );
}

export default LeaderboardRow;