"use client";

import { BrainCircuit, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";

export function DuelModeTabs({ activeMode, onSelect, csQuizRating, mathRating }) {
  const modes = [
    { key: "cs_quiz", label: "CS Quiz", icon: BrainCircuit, subtitle: csQuizRating },
    { key: "math", label: "Math", icon: Sigma, subtitle: mathRating },
  ];

  return (
    <div className="flex gap-2 sm:gap-3">
      {modes.map((mode) => {
        const isActive = activeMode === mode.key;
        return (
         <button
            key={mode.key}
            onClick={() => onSelect(mode.key)}
            className={cn(
              "flex w-24 shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all sm:w-28 sm:gap-2 sm:p-4",
              isActive
                ? "border-primary bg-primary/10 shadow-[0_0_0_3px_var(--color-primary)_inset]"
                : "border-border bg-secondary/40 hover:bg-secondary/60"
            )}
          >
            <div className={cn("flex size-8 items-center justify-center rounded-lg sm:size-10", isActive ? "bg-gradient-brand" : "bg-secondary")}>
              <mode.icon className={cn("size-4 sm:size-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
            </div>
            <span className="font-display text-[11px] uppercase text-foreground sm:text-xs">{mode.label}</span>
            <span className="text-[9px] font-semibold text-muted-foreground sm:text-[10px]">{mode.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

export default DuelModeTabs;