import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function MessagesFab() {
  return (
    <Link
      href="/chat"
      aria-label="Messages"
      className="fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
    >
      <MessageCircle className="size-6" />
    </Link>
  );
}

export default MessagesFab;