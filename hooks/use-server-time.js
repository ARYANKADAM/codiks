"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";

/**
 * Firebase publishes the client-server clock drift at .info/serverTimeOffset.
 * Adding it to Date.now() gives an estimate of "server now" — keeping the
 * battle countdown in sync even if two machines' system clocks disagree.
 */
export function useServerTimeOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const offsetRef = ref(realtimeDB, ".info/serverTimeOffset");
    const unsubscribe = onValue(offsetRef, (snapshot) => setOffset(snapshot.val() ?? 0));
    return () => unsubscribe();
  }, []);

  return offset;
}

export default useServerTimeOffset;