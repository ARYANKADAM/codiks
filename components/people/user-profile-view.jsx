"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Check, Clock, Swords } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameRatingsRow } from "@/components/profile/game-ratings-row";

export function UserProfileView({ user, friendStatus, requestId }) {
  const [status, setStatus] = useState(friendStatus);
  const router = useRouter();

  async function handleAdd() {
    setStatus("outgoing");
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.status === "accepted") setStatus("friend");
      toast.success(data.status === "accepted" ? "You're now friends!" : "Friend request sent");
    } catch (err) {
      toast.error(err.message);
      setStatus("none");
    }
  }

  async function handleChallenge() {
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId, mode: "cs_quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Challenge sent to ${user.username}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className="h-32 w-full bg-gradient-brand sm:h-40"
          style={user.bannerUrl ? { backgroundImage: `url(${user.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <CardContent className="relative px-6 pb-6">
          <div className="-mt-10 mb-3">
            <Avatar src={user.avatarUrl} alt={user.username} size="xl" className="ring-4 ring-card" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold">{user.username}</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleChallenge}>
                <Swords className="size-4" /> Challenge
              </Button>
              {status === "friend" && (
                <Button variant="secondary" disabled>
                  <Check className="size-4" /> Friends
                </Button>
              )}
              {status === "outgoing" && (
                <Button variant="secondary" disabled>
                  <Clock className="size-4" /> Pending
                </Button>
              )}
              {status === "incoming" && (
                <Button onClick={() => router.push("/dashboard/profile")}>Respond in Friends</Button>
              )}
              {status === "none" && (
                <Button onClick={handleAdd}>
                  <UserPlus className="size-4" /> Add Friend
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <GameRatingsRow mathRating={user.mathRating} csQuizRating={user.csQuizRating} />
    </div>
  );
}

export default UserProfileView;