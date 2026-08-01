"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Swords } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/shared/dialog-overlay";

const MODE_LABEL = { math: "Math Duel", cs_quiz: "CS Quiz Duel" };

export function ChallengeInviteModal({ challenge, onClear }) {
  const router = useRouter();

  async function respond(action) {
    try {
      const res = await fetch("/api/challenges/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          fromClerkId: challenge.fromClerkId,
          mode: challenge.mode,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (action === "accept" && data?.roomId) {
        const destination = data.mode === "math" ? "math-duel" : "coding-quiz";
        router.push(`/${destination}/${data.roomId}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      onClear();
    }
  }

  return (
    <DialogOverlay isOpen={Boolean(challenge)} onClose={onClear} labelledBy="challenge-title">
      {challenge && (
        <>
          <div className="flex size-20 items-center justify-center rounded-full bg-gradient-brand">
            <Swords className="size-9 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={challenge.fromAvatarUrl} alt={challenge.fromUsername} size="md" />
            <div className="text-left">
              <p id="challenge-title" className="font-bold">
                {challenge.fromUsername}
              </p>
              <p className="text-sm text-muted-foreground">wants to duel you — {MODE_LABEL[challenge.mode]}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => respond("decline")}>
              Decline
            </Button>
            <Button onClick={() => respond("accept")}>Accept</Button>
          </div>
        </>
      )}
    </DialogOverlay>
  );
}

export default ChallengeInviteModal;