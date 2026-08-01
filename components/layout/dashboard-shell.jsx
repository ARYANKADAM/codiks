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

export function DashboardShell({ user, children }) {
  const { isCollapsed } = useSidebar();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  useGlobalPresence(user?.clerkId);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={user?.role === "admin"} user={user} />
      <MobileTopbar />
      <ChallengeListener />
      <main
        id="main-content"
        className={cn("min-h-screen pb-20 transition-all duration-200 lg:pb-0", isCollapsed ? "lg:pl-16" : "lg:pl-64")}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>
     <MobileBottomNav onMoreClick={() => setIsMoreOpen(true)} />
      <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} user={user} />
      <MessagesFab />
    </div>
  );
}

export default DashboardShell;