import Link from "next/link";
import { siteConfig } from "@/config/site";

export function MobileTopbar() {
  return (
    <div className="sticky top-0 z-30 flex h-12 items-center justify-center border-b border-border bg-card lg:hidden">
      <Link href="/dashboard" className="font-display text-base uppercase text-gradient-brand">
        {siteConfig.name}
      </Link>
    </div>
  );
}

export default MobileTopbar;