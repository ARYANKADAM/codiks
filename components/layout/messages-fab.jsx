"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";
import { isThreadUnread } from "@/hooks/use-chat-read-state";

export function MessagesFab() {
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        const inbox = Array.isArray(data?.inbox) ? data.inbox : [];
        setHasUnread(inbox.some((t) => isThreadUnread(t, data?.me?.clerkId)));
      })
      .catch(() => {});
  }, [user?.id]);

  return (
    <Link
      href="/chat"
      aria-label="Messages"
      className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
    >
      <MessageCircle className="size-4" />
      Messages
      {hasUnread && <span className="size-2 rounded-full bg-destructive" />}
    </Link>
  );
}

export default MessagesFab;