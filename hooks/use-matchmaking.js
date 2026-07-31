"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useRouter } from "next/navigation";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";
import { toast } from "sonner";

const TICK_INTERVAL_MS = 2500;

export function useMatchmaking(userId) {
  const [status, setStatus] = useState("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const tickTimer = useRef(null);
  const startedAt = useRef(null);
  const router = useRouter();

  const stopPolling = useCallback(() => {
    if (tickTimer.current) {
      clearInterval(tickTimer.current);
      tickTimer.current = null;
    }
  }, []);

  const leaveQueue = useCallback(async () => {
    stopPolling();
    setStatus("idle");
    setElapsedMs(0);
    if (userId) {
      await fetch("/api/matchmaking/leave", { method: "POST" }).catch(() => {});
    }
  }, [userId, stopPolling]);

  const joinQueue = useCallback(
    async (mode = "coding") => {
      if (!userId) return;
      setStatus("searching");
      startedAt.current = Date.now();

      const res = await fetch("/api/matchmaking/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        setStatus("idle");
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not join matchmaking queue");
      }

      let consecutiveFailures = 0;
      tickTimer.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAt.current);
        fetch("/api/matchmaking/tick", { method: "POST" })
          .then((res) => {
            if (!res.ok) throw new Error("tick failed");
            consecutiveFailures = 0;
          })
          .catch(() => {
            consecutiveFailures += 1;
            if (consecutiveFailures >= 5) {
              stopPolling();
              setStatus("error");
              toast.error("Matchmaking is having trouble — please try again.");
            }
          });
      }, TICK_INTERVAL_MS);
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;

    const assignmentRef = ref(realtimeDB, realtimePaths.matchmakingAssignment(userId));
    const unsubscribe = onValue(assignmentRef, (snapshot) => {
      const assignment = snapshot.val();
    if (assignment?.roomId) {
        stopPolling();
        setStatus("matched");
        // Ask the server to clear this assignment now that we've consumed
        // it — clients can't write this path directly under the security
        // rules, so without this call it lingers forever and re-triggers
        // this exact listener (and re-navigation) on every future mount.
        fetch("/api/matchmaking/clear-assignment", { method: "POST" }).catch(() => {});
       const destination = assignment.mode === "math" ? "math-duel" : "coding-quiz";
        router.push(`/${destination}/${assignment.roomId}`);
      }
    });

    return () => unsubscribe();
  }, [userId, router, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  return { status, elapsedMs, joinQueue, leaveQueue };
}

export default useMatchmaking;