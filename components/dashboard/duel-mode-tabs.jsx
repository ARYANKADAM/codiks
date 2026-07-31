"use client";

import { Code2, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";

export function DuelModeTabs({ activeMode, onSelect, rating, mathRating }) {
  const modes = [
    { key: "coding", label: "Coding", icon: Code2, subtitle: rating },
    { key: "math", label: "Math", icon: Sigma, subtitle: mathRating },
  ];

  return (
    <div className="flex gap-3">
      {modes.map((mode) => {
        const isActive = activeMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onSelect(mode.key)}
            className={cn(
              "flex w-28 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              isActive
                ? "border-primary bg-primary/10 shadow-[0_0_0_3px_var(--color-primary)_inset]"
                : "border-border bg-secondary/40 hover:bg-secondary/60"
            )}
          >
            <div className={cn("flex size-10 items-center justify-center rounded-lg", isActive ? "bg-gradient-brand" : "bg-secondary")}>
              <mode.icon className={cn("size-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
            </div>
            <span className="font-display text-xs uppercase text-foreground">{mode.label}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{mode.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

export default DuelModeTabs;