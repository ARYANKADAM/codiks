"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { ref, onChildAdded, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";

const NotificationsContext = createContext(null);

function getLastSeen(clerkId) {
  if (typeof window === "undefined") return Date.now();
  const stored = window.localStorage.getItem(`notif_last_seen_${clerkId}`);
  return stored ? Number(stored) : Date.now();
}
function setLastSeen(clerkId, ts) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`notif_last_seen_${clerkId}`, String(ts));
}

export function NotificationsProvider({ clerkId, children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [version, setVersion] = useState(0); // bumped on every new event, for consumers like chat inbox to refetch
  const lastSeenRef = useRef(0);

  const refreshUnreadCount = useCallback(() => {
    if (!clerkId) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [clerkId]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Exactly ONE live listener for the whole app, mounted once here.
  useEffect(() => {
    if (!clerkId) return;
    lastSeenRef.current = getLastSeen(clerkId);
    const notifRef = ref(realtimeDB, realtimePaths.userNotifications(clerkId));

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data || data.createdAt <= lastSeenRef.current) return;

      lastSeenRef.current = data.createdAt;
      setLastSeen(clerkId, data.createdAt);

      if (data.type === "streak_updated") {
        toast(data.title, { description: data.message, icon: "🔥", duration: 4000 });
      } else {
        toast(data.title, { description: data.message });
      }
      refreshUnreadCount();
      setVersion((v) => v + 1);
    };

    onChildAdded(notifRef, handleChildAdded);
    return () => off(notifRef, "child_added", handleChildAdded);
  }, [clerkId, refreshUnreadCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount, version }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}

export default NotificationsProvider;