"use client";

import { ref, update, serverTimestamp } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function setPresenceMode(userId, mode) {
  if (!userId) return;
  const presenceRef = ref(realtimeDB, realtimePaths.presence(userId));
  update(presenceRef, { mode, updatedAt: serverTimestamp() }).catch(() => {});
}

export default setPresenceMode;