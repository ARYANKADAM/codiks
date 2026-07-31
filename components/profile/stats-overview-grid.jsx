import { Flame, Swords, ShieldCheck, Zap } from "lucide-react";
import { getTierForRating } from "@/lib/tier";

function Tile({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <Icon className="size-6" style={accent ? { color: accent } : undefined} />
    </div>
  );
}

export function StatsOverviewGrid({ bestDailyStreak, mathStats, csQuizStats, mathRating, csQuizRating }) {
  const totalDuels = (mathStats?.totalBattles ?? 0) + (csQuizStats?.totalBattles ?? 0);
  const totalWins = (mathStats?.wins ?? 0) + (csQuizStats?.wins ?? 0);
  const bestTier = getTierForRating(Math.max(mathRating, csQuizRating));
  // Simple derived number — not a persisted currency, just a rough sense
  // of overall activity/skill for the profile display.
  const totalXp = totalDuels * 10 + totalWins * 15;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile icon={Flame} value={bestDailyStreak} label="Max streak" accent="oklch(0.7 0.2 40)" />
      <Tile icon={Swords} value={totalDuels} label="Total duels" />
      <Tile icon={ShieldCheck} value={bestTier.label} label="League" accent={bestTier.color} />
      <Tile icon={Zap} value={totalXp} label="Total XP" accent="oklch(0.78 0.16 85)" />
    </div>
  );
}

export default StatsOverviewGrid;