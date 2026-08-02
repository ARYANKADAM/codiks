"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Check, Clock, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FriendActionButton({ targetClerkId, username, initialStatus, requestId }) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function sendRequest() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(data.status === "accepted" ? "friend" : "outgoing");
      toast.success(data.status === "accepted" ? `You're now friends with ${username}` : "Friend request sent");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function respond(action) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(action === "accept" ? "friend" : "none");
      toast.success(action === "accept" ? "Friend request accepted" : "Request declined");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeFriend(confirmText) {
  if (!confirm(confirmText)) return;
  setIsLoading(true);
  try {
    const res = await fetch("/api/friends/remove", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetClerkId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    setStatus("none");
    toast.success("Friend removed");

  } catch (err) {
    toast.error(err.message);
  } finally {
    setIsLoading(false);
  }
}

  if (status === "incoming") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => respond("accept")} disabled={isLoading}>
          <Check className="size-4" /> Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => respond("decline")} disabled={isLoading}>
          <XIcon className="size-4" /> Decline
        </Button>
      </div>
    );
  }

  if (status === "outgoing") {
    return (
      <Button size="sm" variant="secondary" onClick={() => removeFriend("Withdraw your friend request?")} disabled={isLoading}>
        <Clock className="size-4" /> Withdraw
      </Button>
    );
  }

 if (status === "friend") {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => removeFriend(`Remove ${username} as a friend?`)}
      disabled={isLoading}
      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <XIcon className="size-4" />
      Unfriend
    </Button>
  );
}

  return (
    <Button size="sm" onClick={sendRequest} disabled={isLoading}>
      <UserPlus className="size-4" /> Add Friend
    </Button>
  );
}

export default FriendActionButton;