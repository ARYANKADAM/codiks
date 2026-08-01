"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Target, Bell, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications-count";
import { useLiveNotifications } from "@/hooks/use-live-notifications";

const ITEMS = [
  { title: "Arena", href: "/dashboard", icon: LayoutDashboard },
  { title: "Compete", href: "/dashboard/leaderboard", icon: Trophy },
  { title: "Quests", href: "/dashboard/challenges", icon: Target },
  { title: "Feed", href: "/dashboard/notifications", icon: Bell },
];

export function MobileBottomNav({ onMoreClick }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [unreadCount, refresh] = useUnreadNotificationsCount(user?.id);
  useLiveNotifications(user?.id, refresh);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      {ITEMS.map(({ title, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {title}
            {title === "Feed" && unreadCount > 0 && (
              <span className="absolute right-5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
        More
      </button>
    </nav>
  );
}

export default MobileBottomNav;