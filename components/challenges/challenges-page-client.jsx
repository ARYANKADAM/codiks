"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { useCountdown } from "@/hooks/use-countdown-to-utc-midnight";

const TABS = [
  { key: "all", label: "All" },
  { key: "math", label: "Math" },
  { key: "cs_quiz", label: "CS Quiz" },
];

export function ChallengesPageClient({ initialData }) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const countdown = useCountdown(initialData?.resetsInMs ?? 0);

  const filtered = useMemo(() => {
    if (tab === "all") return initialData.challenges;
    return initialData.challenges.filter((c) => c.mode === tab || c.mode === "any");
  }, [tab, initialData.challenges]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">Daily Challenges</h1>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
          ⏱ Resets in {countdown}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>
            {initialData.completedCount} / {initialData.totalCount} completed today
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all"
            style={{ width: `${(initialData.completedCount / initialData.totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <ChallengeCard key={c.key} challenge={c} />
        ))}
      </div>
    </div>
  );
}

export default ChallengesPageClient;