import Link from "next/link";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationList({ notifications }) {
  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="No notifications yet" className="border-none p-8" />;
  }

  return (
    <ul className="max-h-96 divide-y divide-border overflow-y-auto">
      {notifications.map((n) => {
        const content = (
          <div className={cn("px-4 py-3 text-sm hover:bg-secondary/50", !n.isRead && "bg-primary/5")}>
            <p className="font-medium">{n.title}</p>
            <p className="text-xs text-muted-foreground">{n.message}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
          </div>
        );
        return <li key={n.id}>{n.link ? <Link href={n.link}>{content}</Link> : content}</li>;
      })}
    </ul>
  );
}

export default NotificationList;