"use client";

import { useEffect, useState } from "react";
import { ref, onValue, onDisconnect, set, serverTimestamp } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

/**
 * Marks the current player as connected in this room and registers a
 * Firebase onDisconnect hook — if the tab closes, crashes, or loses
 * network, Firebase itself flips this player to offline server-side,
 * without relying on any client code running.
 */
export function useRoomPresence(roomId, userId) {
  const [players, setPlayers] = useState({});

  useEffect(() => {
    if (!roomId || !userId) return;

    const myRef = ref(realtimeDB, realtimePaths.roomPlayer(roomId, userId));
    const playersRef = ref(realtimeDB, realtimePaths.roomPlayers(roomId));

    set(myRef, { connected: true, joinedAt: serverTimestamp() });
    onDisconnect(myRef).update({ connected: false, leftAt: serverTimestamp() });

    const unsubscribe = onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val() ?? {});
    });

    return () => unsubscribe();
  }, [roomId, userId]);

  return players;
}

export default useRoomPresence;