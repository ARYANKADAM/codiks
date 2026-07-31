"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { siteConfig } from "@/config/site";

export function MobileTopbar() {
  const { toggleMobile } = useSidebar();

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
      <Button variant="ghost" size="icon" aria-label="Toggle menu" onClick={toggleMobile}>
        <Menu />
      </Button>
      <Link href="/dashboard" className="font-display text-base uppercase text-gradient-brand">
        {siteConfig.name}
      </Link>
    </div>
  );
}

export default MobileTopbar;