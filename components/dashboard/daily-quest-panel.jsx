"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown-to-utc-midnight";

export function DailyQuestPanel() {
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/daily-challenges").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const countdown = useCountdown(data?.resetsInMs ?? 0);
  const topThree = data?.challenges?.slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Daily Quest · {countdown}
        </CardTitle>
        <Link href="/dashboard/challenges" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        {topThree.map((c) => (
          <div key={c.key} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{c.title}</p>
              <Button
                size="sm"
                variant={c.completed ? "secondary" : "outline"}
                disabled={c.completed}
                onClick={() => router.push("/dashboard#duel-hub")}
              >
                {c.completed ? "Done" : "Play Now"}
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all"
                  style={{ width: `${(c.current / c.target) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {c.current}/{c.target}
              </span>
            </div>
          </div>
        ))}
        {!data && <p className="text-xs text-muted-foreground">Loading…</p>}
      </CardContent>
    </Card>
  );
}

export default DailyQuestPanel;