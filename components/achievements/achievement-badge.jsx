import { Lock, Star } from "lucide-react";
import { AchievementIcon } from "@/components/shared/achievement-icon";
import { cn } from "@/lib/utils";

export function AchievementBadge({ achievement, isSelected, onToggle, selectionDisabled }) {
  const { unlocked, icon, title } = achievement;

  return (
    <button
      type="button"
      onClick={unlocked ? onToggle : undefined}
      disabled={!unlocked || (selectionDisabled && !isSelected)}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all disabled:cursor-not-allowed",
        unlocked
          ? isSelected
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/50"
          : "border-border/50 bg-secondary/20 opacity-50"
      )}
    >
      {isSelected && (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Star className="size-3 fill-current" />
        </span>
      )}
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-xl",
          unlocked ? "bg-gradient-brand" : "bg-secondary"
        )}
      >
        {unlocked ? <AchievementIcon icon={icon} className="size-7 text-primary-foreground" /> : <Lock className="size-6 text-muted-foreground" />}
      </div>
      <p className={cn("text-xs font-bold uppercase", !unlocked && "text-muted-foreground")}>{title}</p>
    </button>
  );
}

export default AchievementBadge;