"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, UserPlus, Clock, Sigma, BrainCircuit } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { usePresenceList } from "@/hooks/use-presence-list";

const MODE_ICON = { math: Sigma, cs_quiz: BrainCircuit };

function UserRow({ user, presence }) {
  const [status, setStatus] = useState(user.friendStatus);
  const isOnline = Boolean(presence?.connected);
  const mode = presence?.mode;
  const ModeIcon = mode && mode !== "idle" ? MODE_ICON[mode] : null;

  async function sendRequest() {
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
      toast.success(data.status === "accepted" ? `You're now friends with ${user.username}` : "Friend request sent");
    } catch (err) {
      toast.error(err.message);
      setStatus("none");
    }
  }

  async function sendChallenge() {
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId, mode: mode && mode !== "idle" ? mode : "cs_quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Challenge sent to ${user.username}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <button onClick={isOnline ? sendChallenge : undefined} disabled={!isOnline} className="disabled:cursor-not-allowed">
        <Avatar src={user.avatarUrl} alt={user.username} size="md" className={isOnline ? "ring-2 ring-success" : "opacity-60"} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.username}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {ModeIcon && <ModeIcon className="size-3" />}
          {isOnline ? (ModeIcon ? "In a duel" : "Online") : "Offline"}
        </p>
      </div>

      {status === "friend" && (
        <span className="flex items-center gap-1 text-xs font-medium text-success">
          <Check className="size-3" /> Friends
        </span>
      )}
      {status === "outgoing" && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> Pending
        </span>
      )}
      {status === "incoming" && (
        <span className="text-xs font-medium text-primary">Respond in Friends</span>
      )}
      {status === "none" && (
        <Button size="sm" variant="outline" onClick={sendRequest}>
          <UserPlus className="size-3" /> Add
        </Button>
      )}
    </div>
  );
}

export function PeopleDirectoryClient({ users }) {
  const presenceMap = usePresenceList();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {users.map((u) => (
        <UserRow key={u.id} user={u} presence={presenceMap[u.clerkId]} />
      ))}
    </div>
  );
}

export default PeopleDirectoryClient;