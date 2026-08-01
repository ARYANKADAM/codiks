"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User as UserIcon, Swords } from "lucide-react";
import { DialogOverlay } from "@/components/shared/dialog-overlay";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";

export function StoryActionMenu({ user, isOpen, onClose }) {
  const router = useRouter();

  async function handleChallenge() {
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId, mode: "cs_quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Challenge sent to ${user.username} — waiting for them to accept…`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      onClose();
    }
  }

  function handleViewProfile() {
    onClose();
    router.push(`/dashboard/people?highlight=${user.clerkId}`);
  }

  if (!user) return null;

  return (
    <DialogOverlay isOpen={isOpen} onClose={onClose} labelledBy="story-action-title" closeOnEscape>
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-col items-center gap-2 text-center">
          <Avatar src={user.avatarUrl} alt={user.username} size="lg" />
          <p id="story-action-title" className="font-semibold">
            {user.username}
          </p>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={handleViewProfile}>
            <UserIcon className="size-4" /> View Profile
          </Button>
          <Button className="w-full justify-start" onClick={handleChallenge}>
            <Swords className="size-4" /> Challenge — 1 min Duel
          </Button>
        </div>
      </div>
    </DialogOverlay>
  );
}

export default StoryActionMenu;