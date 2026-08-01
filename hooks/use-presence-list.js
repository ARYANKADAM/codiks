"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";

export function usePresenceList() {
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    const presenceRef = ref(realtimeDB, "presence");
    const unsubscribe = onValue(presenceRef, (snap) => setPresenceMap(snap.val() ?? {}));
    return () => unsubscribe();
  }, []);

  return presenceMap;
}

export default usePresenceList;