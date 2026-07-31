"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useOpponentAnswer(battleId, opponentClerkId) {
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    if (!battleId || !opponentClerkId) return;
    const answerRef = ref(realtimeDB, realtimePaths.battleAnswer(battleId, opponentClerkId));
    const unsubscribe = onValue(answerRef, (snapshot) => setAnswer(snapshot.val()));
    return () => unsubscribe();
  }, [battleId, opponentClerkId]);

  return answer;
}

export default useOpponentAnswer;