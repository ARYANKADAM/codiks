"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ref, onChildAdded, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

export function useLiveNotifications(clerkId, onNewNotification) {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!clerkId) return;
    const notifRef = ref(realtimeDB, realtimePaths.userNotifications(clerkId));

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data || data.createdAt < mountedAt.current) return;

      if (data.type === "streak_updated") {
        toast(data.title, { description: data.message, icon: "🔥", duration: 4000 });
      } else {
        toast(data.title, { description: data.message });
      }
      onNewNotification?.();
    };

    onChildAdded(notifRef, handleChildAdded);
    return () => off(notifRef, "child_added", handleChildAdded);
  }, [clerkId, onNewNotification]);
}

export default useLiveNotifications;