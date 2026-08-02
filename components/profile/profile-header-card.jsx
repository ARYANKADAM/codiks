"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Swords } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { BannerUpload } from "@/components/profile/banner-upload";
import { FriendsModal } from "@/components/profile/friends-modal";
import { FriendActionButton } from "@/components/profile/friend-action-button";

export function ProfileHeaderCard({
  isOwner,
  targetClerkId,
  username,
  avatarUrl,
  bannerUrl,
  memberSince,
  friendsCount,
  friendStatus,
  requestId,
}) {
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  async function handleChallenge() {
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId, mode: "cs_quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Challenge sent to ${username}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="relative h-28 w-full bg-gradient-brand sm:h-40 md:h-52"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {isOwner && (
          <div className="absolute right-3 top-3">
            <BannerUpload />
          </div>
        )}
        <div className="absolute -bottom-8 left-4 sm:-bottom-10 sm:left-6">
          <Avatar src={avatarUrl} alt={username} size="xl" className="ring-4 ring-card" />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-6 sm:pt-14">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold sm:text-xl">{username}</h1>
          <p className="text-xs text-muted-foreground">
            Member since{" "}
            {memberSince ? new Date(memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}
          </p>
          {isOwner ? (
            <button onClick={() => setIsFriendsOpen(true)} className="mt-1 text-sm font-semibold text-primary hover:underline">
              {friendsCount} {friendsCount === 1 ? "Friend" : "Friends"}
            </button>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {friendsCount} {friendsCount === 1 ? "Friend" : "Friends"}
            </p>
          )}
        </div>

        {!isOwner && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleChallenge}>
              <Swords className="size-4" /> Challenge
            </Button>
            <FriendActionButton targetClerkId={targetClerkId} username={username} initialStatus={friendStatus} requestId={requestId} />
          </div>
        )}
      </div>

      {isOwner && <FriendsModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />}
    </div>
  );
}

export default ProfileHeaderCard;