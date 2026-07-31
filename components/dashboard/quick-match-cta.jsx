"use client";

import { Swords, Sigma } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { SearchingOverlay } from "@/components/matchmaking/searching-overlay";

const COPY = {
  coding: {
    title: "Ready to duel?",
    description: "Get matched with an opponent near your rating.",
    cta: "Find a match",
    icon: Swords,
  },
  math: {
    title: "Ready for a math sprint?",
    description: "Race an opponent to solve the most in 60 seconds.",
    cta: "Find a math duel",
    icon: Sigma,
  },
};

export function QuickMatchCta({ mode = "coding" }) {
  const { user } = useUser();
  const { status, elapsedMs, joinQueue, leaveQueue } = useMatchmaking(user?.id);
  const copy = COPY[mode] ?? COPY.coding;
  const Icon = copy.icon;

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-between gap-4 bg-gradient-brand p-6 text-primary-foreground sm:flex-row">
          <div>
            <h3 className="text-lg font-bold">{copy.title}</h3>
            <p className="text-sm opacity-90">{copy.description}</p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => joinQueue(mode).catch((err) => toast.error(err.message))}
            disabled={status === "searching"}
          >
            <Icon />
            {status === "searching" ? "Searching…" : copy.cta}
          </Button>
        </CardContent>
      </Card>

      <SearchingOverlay isOpen={status === "searching"} elapsedMs={elapsedMs} onCancel={leaveQueue} />
    </>
  );
}

export default QuickMatchCta;