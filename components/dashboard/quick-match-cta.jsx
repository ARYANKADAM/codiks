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
       <CardContent
className="
flex
flex-col
gap-4
bg-gradient-brand
p-4
text-primary-foreground

sm:flex-row
sm:items-center
sm:justify-between
sm:p-6
">
          <div className="flex-1 min-w-0">
           <h3 className="text-base font-bold leading-tight sm:text-lg">{copy.title}</h3>
            <p className="mt-1 text-xs leading-relaxed opacity-90 sm:text-sm">{copy.description}</p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => joinQueue(mode).catch((err) => toast.error(err.message))}
            disabled={status === "searching"}
           className="
mt-1
w-full

sm:mt-0
sm:w-auto
sm:min-w-[220px]
"
          >
            <Icon className="size-4 sm:size-5" />
            {status === "searching" ? "Searching…" : copy.cta}
          </Button>
        </CardContent>
      </Card>

      <SearchingOverlay isOpen={status === "searching"} elapsedMs={elapsedMs} onCancel={leaveQueue} />
    </>
  );
}

export default QuickMatchCta;