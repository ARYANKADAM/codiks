import Link from "next/link";
import { MessageCircle } from "lucide-react";

// If your Messages feature tracks unread counts, thread a real number in
// as an `unreadCount` prop here and swap the static badge for it.
export function MessagesLinkMobile() {
  return (
    <Link
      href="/chat"
      aria-label="Messages"
      className="relative flex size-9 items-center justify-center rounded-full border border-border bg-secondary lg:hidden"
    >
      <MessageCircle className="size-4" />
    </Link>
  );
}

export default MessagesLinkMobile;