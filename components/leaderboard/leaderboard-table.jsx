// components/leaderboard/leaderboard-table.jsx
"use client";

import { Trophy, Crown } from "lucide-react";
import { TierBadge } from "@/components/shared/tier-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar } from "@/components/shared/avatar";
import { cn } from "@/lib/utils";

const PODIUM_ACCENT = {
  1: "#F4C550",
  2: "#C9D1D9",
  3: "#CE8946",
};

// Angular one-corner-cut frame, used on every avatar in the app's leaderboard context
const CLIP = "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)";

// components/leaderboard/leaderboard-table.jsx — responsive tweaks

function PodiumCard({ entry, isMe }) {
  const accent = PODIUM_ACCENT[entry.rank];
  const isFirst = entry.rank === 1;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-sm border bg-[#141C24] px-1.5 pb-3 pt-5 transition-transform sm:px-4 sm:pb-5 sm:pt-8",
        isFirst ? "order-2 -translate-y-2 sm:-translate-y-3" : entry.rank === 2 ? "order-1" : "order-3",
        isMe ? "border-[#FF4655]/60" : "border-white/10"
      )}
      style={{ boxShadow: `0 0 32px -12px ${accent}66` }}
    >
      <span
        className="font-display absolute -top-2.5 left-1/2 -translate-x-1/2 text-2xl italic sm:-top-4 sm:text-4xl"
        style={{ color: accent, textShadow: `0 0 18px ${accent}88` }}
      >
        {entry.rank}
      </span>

      {isFirst && (
        <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 sm:-top-11" size={14} style={{ color: accent }} />
      )}

      <div className="relative mt-1.5 sm:mt-2" style={{ clipPath: CLIP }}>
        <Avatar src={entry.avatarUrl} alt={entry.username} size={isFirst ? "md" : "sm"} className="border-2 sm:hidden" style={{ borderColor: accent }} />
        <Avatar src={entry.avatarUrl} alt={entry.username} size={isFirst ? "lg" : "md"} className="hidden border-2 sm:block" style={{ borderColor: accent }} />
      </div>

      <p className="font-hud mt-2 line-clamp-2 max-w-[4.6rem] text-center text-[10px] font-semibold uppercase leading-tight text-[#ECE8E1] sm:mt-3 sm:max-w-[8rem] sm:text-sm sm:leading-normal">
        {entry.username}
        {isMe && <span className="ml-1 text-[9px] text-[#FF4655] sm:text-[10px]">(you)</span>}
      </p>
      <p className="font-hud mt-1 whitespace-nowrap text-[9px] tracking-wide text-white/40 sm:mt-0 sm:text-[11px]">
        <span className="text-emerald-400">{entry.stats?.wins ?? 0}W</span>
        {" – "}
        <span className="text-[#FF4655]/80">{entry.stats?.losses ?? 0}L</span>
      </p>

      <div className="mt-1.5 scale-90 sm:mt-2 sm:scale-100">
        <TierBadge rating={entry.rating} size="sm" />
      </div>
    </div>
  );
}

function Row({ entry, isMe }) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 border-b border-white/5 px-3 py-2.5 transition-colors last:border-b-0 sm:gap-4 sm:px-4 sm:py-3",
        isMe ? "bg-[#FF4655]/[0.06]" : "hover:bg-white/[0.03]"
      )}
    >
      <span className={cn("absolute left-0 top-0 h-full w-[3px] transition-colors", isMe ? "bg-[#FF4655]" : "bg-white/10 group-hover:bg-[#FF4655]/60")} />

      <span className="font-display w-6 shrink-0 text-center text-lg italic text-white/25 sm:w-10 sm:text-2xl">
        {String(entry.rank).padStart(2, "0")}
      </span>

      <div style={{ clipPath: CLIP }} className="shrink-0">
        <Avatar src={entry.avatarUrl} alt={entry.username} size="sm" className={cn("border-2", isMe ? "border-[#FF4655]" : "border-white/10")} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-hud truncate text-xs font-semibold uppercase tracking-wide text-[#ECE8E1] sm:text-sm sm:tracking-wide">
          {entry.username}
          {isMe && <span className="ml-1.5 rounded-[2px] bg-[#FF4655]/20 px-1 py-0.5 text-[9px] font-bold text-[#FF4655] sm:ml-2 sm:px-1.5 sm:text-[10px]">YOU</span>}
        </p>
        <p className="font-hud whitespace-nowrap text-[10px] text-white/40 sm:text-[11px]">
          <span className="text-emerald-400">{entry.stats?.wins ?? 0}W</span>
          {" – "}
          <span className="text-[#FF4655]/80">{entry.stats?.losses ?? 0}L</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <TierBadge rating={entry.rating} size="sm" />
        <span className="font-display text-xs text-[#ECE8E1] sm:hidden">{entry.rating}</span>
        <span className="font-display hidden text-lg text-[#ECE8E1] sm:inline">{entry.rating}</span>
      </div>
    </div>
  );
}

export function LeaderboardTable({ entries, currentUserClerkId, currentUserEntry }) {
  if (entries.length === 0) {
    return <EmptyState icon={Trophy} title="No ranked players yet" description="Play a battle to be the first on the board." />;
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {podium.length === 3 && (
        <div className="grid grid-cols-3 items-end gap-2 pt-8 sm:gap-4 sm:pt-4">
          {podium.map((entry) => (
            <PodiumCard key={entry.clerkId} entry={entry} isMe={entry.clerkId === currentUserClerkId} />
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0F1923]">
        {(podium.length === 3 ? rest : entries).map((entry) => (
          <Row key={entry.clerkId} entry={entry} isMe={entry.clerkId === currentUserClerkId} />
        ))}

        {currentUserEntry && (
          <>
            <div className="font-hud border-t border-dashed border-white/15 px-4 py-2 text-center text-[10px] uppercase tracking-[0.15em] text-white/30 sm:text-[11px] sm:tracking-[0.2em]">
              — your standing —
            </div>
            <Row entry={currentUserEntry} isMe />
          </>
        )}
      </div>
    </div>
  );
}

export default LeaderboardTable;