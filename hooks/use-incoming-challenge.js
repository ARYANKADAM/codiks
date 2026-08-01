"use client";

import { useEffect, useState } from "react";
import { ref, onChildAdded, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useIncomingChallenge(userId) {
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const challengesRef = ref(realtimeDB, realtimePaths.challenges(userId));

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (data?.status === "pending") setChallenge(data);
    };

    onChildAdded(challengesRef, handleChildAdded);
    return () => off(challengesRef, "child_added", handleChildAdded);
  }, [userId]);

  return [challenge, setChallenge];
}

export default useIncomingChallenge;