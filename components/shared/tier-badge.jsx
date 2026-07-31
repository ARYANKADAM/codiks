import { getTierForRating } from "@/lib/tier";

const SIZE_CLASSES = {
  sm: "gap-1 px-2 py-0.5 text-xs",
  md: "gap-1.5 px-3 py-1 text-sm",
  lg: "gap-2 px-4 py-1.5 text-base",
};

const ICON_SIZE = { sm: "size-3", md: "size-4", lg: "size-5" };

export function TierBadge({ rating, size = "md", showRating = true }) {
  const tier = getTierForRating(rating);
  const Icon = tier.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: `color-mix(in oklch, ${tier.color} 18%, transparent)`, color: tier.color }}
    >
      <Icon className={ICON_SIZE[size]} />
      {tier.label}
      {showRating && <span className="opacity-70">· {rating}</span>}
    </span>
  );
}

export default TierBadge;