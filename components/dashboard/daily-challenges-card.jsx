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
        <CardContent className="p-4 sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-base uppercase sm:text-lg">Daily Challenges</h3>
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Complete to earn rewards</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {data && (
                <span className="hidden rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground xs:inline-block">
                  ⏱ {countdown}
                </span>
              )}
              <ChevronRight className="size-4 text-muted-foreground sm:size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary sm:h-2.5">
              <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-bold sm:text-xs">
              {completed}/{total}
            </span>
            <Trophy className="size-3.5 shrink-0 text-warning sm:size-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default DailyChallengesCard;