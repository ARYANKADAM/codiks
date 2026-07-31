"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useQuizSession(roomId) {
  const [session, setSession] = useState(null);
  useEffect(() => {
    if (!roomId) return;
    const sessionRef = ref(realtimeDB, realtimePaths.quizSession(roomId));
    const unsubscribe = onValue(sessionRef, (snap) => setSession(snap.val()));
    return () => unsubscribe();
  }, [roomId]);
  return session;
}

export default useQuizSession;