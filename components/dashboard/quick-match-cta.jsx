"use client";

import { BrainCircuit, Sigma } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { SearchingOverlay } from "@/components/matchmaking/searching-overlay";

const COPY = {
  cs_quiz: {
    title: "Ready to test your CS fundamentals?",
    description: "Race an opponent through complexity, data structures & core concepts.",
    cta: "Find a CS quiz duel",
    icon: BrainCircuit,
  },
  math: {
    title: "Ready for a math sprint?",
    description: "Race an opponent to solve the most in 60 seconds.",
    cta: "Find a math duel",
    icon: Sigma,
  },
};

export function QuickMatchCta({ mode = "cs_quiz" }) {
  const { user } = useUser();
  const { status, elapsedMs, joinQueue, leaveQueue } = useMatchmaking(user?.id);
  const copy = COPY[mode] ?? COPY.cs_quiz;
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