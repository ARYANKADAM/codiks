"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ref, onChildAdded, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

/**
 * Listens for new notifications pushed to Firebase and toasts them live.
 * Firebase's onChildAdded fires once for every existing child the first
 * time it attaches (the historical backlog) — mountedAt filters those out
 * so only genuinely new events (pushed after this hook mounted) toast.
 */
export function useLiveNotifications(clerkId, onNewNotification) {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!clerkId) return;
    const notifRef = ref(realtimeDB, realtimePaths.userNotifications(clerkId));

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data || data.createdAt < mountedAt.current) return;
      toast(data.title, { description: data.message });
      onNewNotification?.();
    };

    onChildAdded(notifRef, handleChildAdded);
    return () => off(notifRef, "child_added", handleChildAdded);
  }, [clerkId, onNewNotification]);
}

export default useLiveNotifications;