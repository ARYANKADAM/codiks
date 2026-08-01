"use client";

import Link from "next/link";
import { Users, Trophy, Bell, Settings, ShieldCheck, MessageCircle, X } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/shared/dialog-overlay";

const BASE_ITEMS = [
  { title: "Friends", href: "/dashboard/profile", icon: Users },
  { title: "Messages", href: "/chat", icon: MessageCircle },
  { title: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MoreSheet({ isOpen, onClose, user }) {
  const items =
    user?.role === "admin" ? [...BASE_ITEMS, { title: "Admin", href: "/dashboard/admin", icon: ShieldCheck }] : BASE_ITEMS;

  return (
    <DialogOverlay isOpen={isOpen} onClose={onClose} labelledBy="more-sheet-title">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h2 id="more-sheet-title" className="sr-only">
          More
        </h2>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} alt={user?.username} size="md" />
            <div>
              <p className="text-sm font-semibold">{user?.fullName || user?.username}</p>
              <p className="text-xs text-muted-foreground">@{user?.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <Button asChild className="mb-5 w-full" onClick={onClose}>
          <Link href="/dashboard/profile">View Profile</Link>
        </Button>

        <div className="grid grid-cols-3 gap-4">
          {items.map(({ title, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center hover:bg-secondary/50"
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{title}</span>
            </Link>
          ))}
        </div>
      </div>
    </DialogOverlay>
  );
}

export default MoreSheet;