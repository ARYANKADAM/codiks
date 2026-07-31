import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementIcon } from "@/components/shared/achievement-icon";
import { EmptyState } from "@/components/shared/empty-state";

export function AchievementsGrid({ achievements }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Achievements</CardTitle>
        <Link href="/dashboard/achievements" className="text-xs font-medium text-primary hover:underline">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No badges yet"
            description="Play duels to start earning badges."
            className="border-none p-6"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((a) => (
              <div
                key={a.key}
                className="flex flex-col items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4 text-center"
              >
                <AchievementIcon icon={a.icon} className="size-7 text-primary" />
                <p className="text-xs font-semibold">{a.title}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AchievementsGrid;