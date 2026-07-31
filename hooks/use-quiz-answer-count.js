"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useQuizAnswerCount(roomId, questionIndex) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!roomId || questionIndex == null) return;
    const answersRef = ref(realtimeDB, realtimePaths.quizAnswers(roomId, questionIndex));
    const unsubscribe = onValue(answersRef, (snap) => {
      const val = snap.val();
      setCount(val ? Object.keys(val).length : 0);
    });
    return () => unsubscribe();
  }, [roomId, questionIndex]);
  return count;
}

export default useQuizAnswerCount;