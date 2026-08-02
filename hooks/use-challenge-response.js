"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ref as dbRef, onChildAdded, off, remove } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";

export function useChallengeResponses(userId) {
  const seenRef = useRef(new Set());

  useEffect(() => {
    if (!userId) return;
    const responsesRef = dbRef(realtimeDB, `challengeResponses/${userId}`);

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Guard against re-toasting the same entry if it couldn't be
      // deleted (e.g. a permission error) and the listener re-attaches.
      if (seenRef.current.has(snapshot.key)) return;
      seenRef.current.add(snapshot.key);

      if (data.status === "declined") {
        toast.error(`${data.fromUsername} declined your challenge.`);
      }

      remove(dbRef(realtimeDB, `challengeResponses/${userId}/${snapshot.key}`)).catch((err) => {
        console.warn("Could not clear challenge response:", err?.message);
      });
    };

    onChildAdded(responsesRef, handleChildAdded);
    return () => off(responsesRef, "child_added", handleChildAdded);
  }, [userId]);
}

export default useChallengeResponses;