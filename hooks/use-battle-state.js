"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useBattleState(battleId, shouldTriggerStart) {
  const [state, setState] = useState(null);
  const [hasTriedStart, setHasTriedStart] = useState(false);

  useEffect(() => {
    if (!battleId) return;
    const stateRef = ref(realtimeDB, realtimePaths.battleState(battleId));
    const unsubscribe = onValue(stateRef, (snapshot) => setState(snapshot.val()));
    return () => unsubscribe();
  }, [battleId]);

  useEffect(() => {
    if (!battleId || state || hasTriedStart || !shouldTriggerStart) return;
    setHasTriedStart(true);
    fetch(`/api/battles/${battleId}/start`, { method: "POST" }).catch(() => setHasTriedStart(false));
  }, [battleId, state, hasTriedStart, shouldTriggerStart]);

  return { state, isCompleted: Boolean(state?.completedAt) };
}

export default useBattleState;