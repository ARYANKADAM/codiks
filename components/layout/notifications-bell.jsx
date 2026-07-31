"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveNotifications } from "@/hooks/use-live-notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { useUser } from "@clerk/nextjs";

export function NotificationsBell() {
  const { user } = useUser();
  const clerkId = user?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useLiveNotifications(clerkId, fetchNotifications);

  async function handleOpen() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div ref={panelRef} role="dialog" aria-label="Notifications" className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-xl">
          <div className="border-b border-border px-4 py-2 text-sm font-semibold">Notifications</div>
          <NotificationList notifications={notifications} />
        </div>
      )}
    </div>
  );
}
export default NotificationsBell;