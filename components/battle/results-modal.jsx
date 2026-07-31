"use client";

import { motion } from "framer-motion";
import { Trophy, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/shared/dialog-overlay";

export function ResultsModal({ result, currentUserId }) {
  const router = useRouter();
  if (!result || result.status !== "completed") return null;

  const me = result.results.find((r) => r.clerkId === currentUserId);
  const opponent = result.results.find((r) => r.clerkId !== currentUserId);
  const isDraw = !result.winnerId;
  const iWon = !isDraw && me?.userId === result.winnerId;
  const opponentForfeited = result.reason === "forfeit" && iWon;

  return (
    <DialogOverlay isOpen closeOnEscape={false} labelledBy="results-title" className="p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl"
      >
        <div
          className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${
            isDraw ? "bg-secondary" : iWon ? "bg-gradient-brand" : "bg-destructive/10"
          }`}
        >
          {isDraw ? (
            <Handshake className="size-8 text-muted-foreground" />
          ) : (
            <Trophy className={`size-8 ${iWon ? "text-primary-foreground" : "text-destructive"}`} />
          )}
        </div>

        <h2 id="results-title" className="text-2xl font-bold">{isDraw ? "Draw" : iWon ? "Victory!" : "Defeat"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {opponentForfeited ? `${opponent?.username} forfeited` : `vs ${opponent?.username}`}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {[me, opponent].map((r, i) => (
            <div key={r?.userId ?? i} className="rounded-lg border border-border p-3">
              <p className="truncate text-xs text-muted-foreground">{i === 0 ? "You" : r?.username}</p>
              <p className="text-lg font-bold">{r?.score ?? 0} pts</p>
              <p
                className={`text-sm font-semibold ${
                  (r?.ratingChange ?? 0) > 0 ? "text-success" : (r?.ratingChange ?? 0) < 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {(r?.ratingChange ?? 0) > 0 ? "+" : ""}
                {r?.ratingChange ?? 0}
              </p>
            </div>
          ))}
        </div>

        <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </motion.div>
    </DialogOverlay>
  );
}
export default ResultsModal;