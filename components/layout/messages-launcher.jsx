"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useLiveNotifications } from "@/hooks/use-live-notifications";
import { Button } from "@/components/ui/button";

export function MessagesLauncher({ clerkId }) {
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setUnreadChatCount(data.unreadChatCount ?? 0);
    } catch {
      setUnreadChatCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useLiveNotifications(clerkId, fetchUnread);

  return (
    <Button
      asChild
      className="fixed bottom-4 right-4 z-50 gap-3 rounded-xl border border-border bg-card px-4 py-3 text-foreground shadow-lg hover:bg-secondary sm:bottom-6 sm:right-6"
      variant="ghost"
    >
      <Link href="/chat" aria-label="Open messages">
        <MessageSquare className="size-4 text-primary" />
        <span className="text-sm font-semibold">Messages</span>
        {unreadChatCount > 0 && (
          <span className="ml-1 inline-flex size-2.5 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]" aria-hidden="true" />
        )}
      </Link>
    </Button>
  );
}

export default MessagesLauncher;
