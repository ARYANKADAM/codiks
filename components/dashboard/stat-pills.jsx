import { Swords, Flame } from "lucide-react";
import { TierBadge } from "@/components/shared/tier-badge";

function Pill({ icon: Icon, value, accent }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-bold"
      style={accent ? { color: accent } : undefined}
    >
      <Icon className="size-4" />
      {value}
    </div>
  );
}

export function StatPills({ rating, winStreak, totalBattles }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TierBadge rating={rating} size="md" />
      <Pill icon={Flame} value={winStreak} accent="oklch(0.7 0.2 40)" />
      <Pill icon={Swords} value={totalBattles} />
    </div>
  );
}

export default StatPills;