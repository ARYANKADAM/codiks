"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopbar } from "@/components/layout/mobile-topbar";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

export function DashboardShell({ user, children }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={user?.role === "admin"} user={user} />
      <MobileTopbar />
      <main
        id="main-content"
        className={cn("min-h-screen transition-all duration-200", isCollapsed ? "lg:pl-16" : "lg:pl-64")}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

export default DashboardShell;