"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountdown } from "@/hooks/use-countdown-to-utc-midnight";

export function DailyChallengesCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/daily-challenges").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const countdown = useCountdown(data?.resetsInMs ?? 0);
  const completed = data?.completedCount ?? 0;
  const total = data?.totalCount ?? 6;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Link href="/dashboard/challenges">
      <Card className="cursor-pointer transition-shadow hover:shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg uppercase">Daily Challenges</h3>
              <p className="text-xs text-muted-foreground">Complete to earn rewards</p>
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                  ⏱ {countdown}
                </span>
              )}
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs font-bold">
              {completed}/{total}
            </span>
            <Trophy className="size-4 shrink-0 text-warning" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default DailyChallengesCard;