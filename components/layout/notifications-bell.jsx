"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotificationsContext } from "@/components/providers/notifications-provider";

export function NotificationsBell() {
  const { unreadCount, refreshUnreadCount, version } = useNotificationsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  function fetchList() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {});
  }

  useEffect(() => {
    fetchList();
  }, [version]);

  async function handleOpen() {
    setIsOpen((v) => !v);
    if (!isOpen && unreadCount > 0) {
      await fetch("/api/notifications/read-all", { method: "POST" });
      refreshUnreadCount();
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={handleOpen} aria-label="Notifications">
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-xl">
          <div className="border-b border-border px-4 py-2 text-sm font-semibold">Notifications</div>
          <NotificationList notifications={notifications} />
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;