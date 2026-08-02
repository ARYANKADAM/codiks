"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopbar } from "@/components/layout/mobile-topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MoreSheet } from "@/components/layout/more-sheet";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useGlobalPresence } from "@/hooks/use-global-presence";
import { ChallengeListener } from "@/components/friends/challenge-listener";
import { cn } from "@/lib/utils";
import { MessagesFab } from "@/components/layout/messages-fab";
import { NotificationsProvider } from "@/components/providers/notifications-provider";

export function DashboardShell({ user, children }) {
  const { isCollapsed } = useSidebar();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  useGlobalPresence(user?.clerkId);

 return (
    <NotificationsProvider clerkId={user?.clerkId}>
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Sidebar isAdmin={user?.role === "admin"} user={user} />
        <MobileTopbar />
        <ChallengeListener />
        <main
          id="main-content"
          className={cn("min-h-screen min-w-0 pb-20 transition-all duration-200 lg:pb-0", isCollapsed ? "lg:pl-16" : "lg:pl-64")}
        >
          <div className="min-w-0 p-3 sm:p-4 lg:p-6">{children}</div>
        </main>
        <MobileBottomNav onMoreClick={() => setIsMoreOpen(true)} />
        <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} user={user} />
        <MessagesFab />
      </div>
    </NotificationsProvider>
  );
}

export default DashboardShell;