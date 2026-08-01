"use client";

import { useEffect, useState, useCallback } from "react";

export function useUnreadNotificationsCount(clerkId) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!clerkId) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [clerkId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return [count, refresh];
}

export default useUnreadNotificationsCount;