import { Sigma, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameRatingsRow({ mathRating, csQuizRating }) {
  const items = [
    { key: "math", label: "Math", icon: Sigma, value: mathRating },
    { key: "cs_quiz", label: "CS Quiz", icon: BrainCircuit, value: csQuizRating },
  ];
  const highest = Math.max(mathRating, csQuizRating);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Game Ratings</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "relative rounded-xl border-2 p-4 text-center",
              item.value === highest ? "border-warning bg-warning/5" : "border-border bg-card"
            )}
          >
            {item.value === highest && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-warning px-2 py-0.5 text-[9px] font-bold uppercase text-black">
                Highest
              </span>
            )}
            <item.icon className="mx-auto mb-1 size-5 text-primary" />
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-[10px] uppercase text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameRatingsRow;