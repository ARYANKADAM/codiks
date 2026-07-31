"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { siteConfig } from "@/config/site";
import { TierBadge } from "@/components/shared/tier-badge";
import { NotificationsBell } from "@/components/layout/notifications-bell";

export function Navbar({ user }) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="glass-panel sticky top-0 z-40 h-16">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={toggleMobile}
          >
            <Menu />
          </Button>
          <Link href="/dashboard" className="text-lg font-bold text-gradient-brand">
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex items-center gap-3">
         {user?.rating != null && (
            <div className="hidden sm:block">
              <TierBadge rating={user.rating} size="sm" />
            </div>
          )}
         <NotificationsBell clerkId={user?.clerkId} />
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;