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
        "group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-all duration-300 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4 md:gap-5 md:px-6 lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-[0_0_30px_rgba(124,58,237,.15)]",
        isMe && "border-primary bg-primary/5"
      )}
    >
      {/* Rank */}

      <div className="w-7 shrink-0 text-center sm:w-9 md:w-12">

        <p className="font-display text-lg text-primary sm:text-xl md:text-2xl">

          #{entry.rank}

        </p>

      </div>

      {/* Avatar */}

      <Avatar
        src={entry.avatarUrl}
        alt={entry.username}
        size="sm"
        className="shrink-0 md:hidden"
      />
      <Avatar
        src={entry.avatarUrl}
        alt={entry.username}
        size="md"
        className="hidden shrink-0 md:block"
      />

      {/* Name */}

      <div className="min-w-0 flex-1">

        <h3 className="truncate text-sm font-semibold sm:text-base">

          {entry.username}

          {isMe && (
            <span className="ml-1.5 text-[10px] text-primary sm:ml-2 sm:text-xs">

              YOU

            </span>
          )}

        </h3>

        <p className="truncate text-xs text-muted-foreground sm:text-sm">

          {entry.stats?.wins ?? 0}W • {entry.stats?.losses ?? 0}L
          <span className="ml-2 font-display text-foreground/80 md:hidden">

            {entry.rating}

          </span>

        </p>

      </div>

      {/* Rating */}

      <div className="hidden w-24 text-center md:block lg:w-28">

        <p className="font-display text-xl lg:text-2xl">

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

      <div className="w-20 shrink-0 sm:w-28 md:w-36">

        <TierBadge rating={entry.rating} />

      </div>

      <ChevronRight className="hidden shrink-0 text-muted-foreground transition sm:block lg:group-hover:translate-x-1" />

    </div>
  );
}

export default LeaderboardRow;