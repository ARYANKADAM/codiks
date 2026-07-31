import { Medal, Award, Trophy, Gem, Diamond, Crown } from "lucide-react";

const TIERS = [
  { key: "bronze", label: "Bronze", min: 0, max: 1299, icon: Medal, color: "oklch(0.65 0.14 50)" },
  { key: "silver", label: "Silver", min: 1300, max: 1499, icon: Award, color: "oklch(0.75 0.02 260)" },
  { key: "gold", label: "Gold", min: 1500, max: 1699, icon: Trophy, color: "oklch(0.78 0.16 85)" },
  { key: "platinum", label: "Platinum", min: 1700, max: 1899, icon: Gem, color: "oklch(0.75 0.1 200)" },
  { key: "diamond", label: "Diamond", min: 1900, max: 2099, icon: Diamond, color: "oklch(0.75 0.15 230)" },
  { key: "master", label: "Master", min: 2100, max: Infinity, icon: Crown, color: "oklch(0.65 0.22 25)" },
];

export function getTierForRating(rating) {
  return TIERS.find((t) => rating >= t.min && rating <= t.max) ?? TIERS[0];
}

export function getTierProgress(rating) {
  const tier = getTierForRating(rating);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1] ?? null;

  if (!nextTier) {
    return { tier, nextTier: null, percent: 100, pointsToNext: 0 };
  }

  const span = nextTier.min - tier.min;
  const percent = Math.min(100, Math.round(((rating - tier.min) / span) * 100));

  return { tier, nextTier, percent, pointsToNext: nextTier.min - rating };
}

export const TIER_LIST = TIERS;