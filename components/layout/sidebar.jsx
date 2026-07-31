"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { navItems } from "@/config/nav";
import { siteConfig } from "@/config/site";

function NavLinks({ isCollapsed, onNavigate, isAdmin }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...navItems, { title: "Admin", href: "/dashboard/admin", icon: ShieldCheck }]
    : navItems;

  return (
    <nav className="flex flex-1 flex-col gap-2 p-4">
      {items.map(({ title, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!isCollapsed && <span>{title}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader({ isCollapsed }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border p-4">
      {!isCollapsed && (
        <Link href="/dashboard" className="font-display text-lg uppercase text-gradient-brand">
          {siteConfig.name}
        </Link>
      )}
      <ThemeToggle />
    </div>
  );
}

function SidebarFooter({ isCollapsed, user }) {
  return (
    <div className="mb-6 px-4">
      <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/50">
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "size-9" } }} />
        {!isCollapsed && (
          <Link href="/dashboard/profile" className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline">
            {user?.fullName || user?.username}
          </Link>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ isAdmin, user }) {
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-all duration-200 lg:flex",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarHeader isCollapsed={isCollapsed} />
        <NavLinks isCollapsed={isCollapsed} isAdmin={isAdmin} />
        <SidebarFooter isCollapsed={isCollapsed} user={user} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 size-6 rounded-full border border-border bg-background"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </Button>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobile} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="font-display text-lg uppercase text-gradient-brand">{siteConfig.name}</span>
              <Button variant="ghost" size="icon" onClick={closeMobile} aria-label="Close menu">
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks isCollapsed={false} onNavigate={closeMobile} isAdmin={isAdmin} />
            <SidebarFooter isCollapsed={false} user={user} />
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;