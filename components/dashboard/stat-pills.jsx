import { Swords, Flame } from "lucide-react";

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

export function StatPills({ dailyStreak, totalDuels }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill icon={Flame} value={dailyStreak} accent="oklch(0.7 0.2 40)" />
      <Pill icon={Swords} value={totalDuels} />
    </div>
  );
}

export default StatPills;