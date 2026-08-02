"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useNotificationsContext } from "@/components/providers/notifications-provider";
import { isThreadUnread } from "@/hooks/use-chat-read-state";

export function MessagesLinkMobile() {
  const { version } = useNotificationsContext();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        const inbox = Array.isArray(data?.inbox) ? data.inbox : [];
        setHasUnread(inbox.some((t) => isThreadUnread(t, data?.me?.clerkId)));
      })
      .catch(() => {});
  }, [version]);

  return (
    <Link
      href="/chat"
      aria-label="Messages"
      className="relative flex size-9 items-center justify-center rounded-full border border-border bg-secondary lg:hidden"
    >
      <MessageCircle className="size-4" />
      {hasUnread && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive" />}
    </Link>
  );
}

export default MessagesLinkMobile;