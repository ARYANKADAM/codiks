"use client";

import { useEffect } from "react";
import { ref, set, update, onDisconnect, serverTimestamp } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

/**
 * App-wide (not room-scoped) presence — lets other players see who's
 * currently online for the friends/discover row and direct challenges.
 * Mounted once at the dashboard shell level, so it's active anywhere
 * inside the dashboard, not just on the overview page.
 */
export function useGlobalPresence(userId) {
  useEffect(() => {
    if (!userId) return;
    const presenceRef = ref(realtimeDB, realtimePaths.presence(userId));
    set(presenceRef, { connected: true, mode: "idle", updatedAt: serverTimestamp() });
    onDisconnect(presenceRef).update({ connected: false, updatedAt: serverTimestamp() });

    return () => {
      update(presenceRef, { connected: false, updatedAt: serverTimestamp() }).catch(() => {});
    };
  }, [userId]);
}

export default useGlobalPresence;