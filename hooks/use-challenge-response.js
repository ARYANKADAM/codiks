"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ref, onChildAdded, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";

export function useChallengeResponses(userId) {
  useEffect(() => {
    if (!userId) return;
    const responsesRef = ref(realtimeDB, `challengeResponses/${userId}`);

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      if (data.status === "declined") {
        toast.error(`${data.fromUsername} declined your challenge.`);
      }
      // "accepted" needs no toast here — the matchmaking-assignment
      // listener already handles auto-navigating both players in.
    };

    onChildAdded(responsesRef, handleChildAdded);
    return () => off(responsesRef, "child_added", handleChildAdded);
  }, [userId]);
}

export default useChallengeResponses;