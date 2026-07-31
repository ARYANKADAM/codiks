import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementIcon } from "@/components/shared/achievement-icon";
import { cn } from "@/lib/utils";

export function AchievementsGrid({ achievements }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {achievements.map((a) => (
          <div
            key={a.key}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 text-center",
              a.unlocked ? "border-primary/40 bg-primary/5" : "border-border opacity-50"
            )}
          >
            {a.unlocked ? <AchievementIcon icon={a.icon} className="size-6 text-primary" /> : <Lock className="size-6 text-muted-foreground" />}
            <p className="text-xs font-semibold">{a.title}</p>
            <p className="text-[10px] text-muted-foreground">{a.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default AchievementsGrid;