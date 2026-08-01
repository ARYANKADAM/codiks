"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Check, Sigma, BrainCircuit } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { usePresenceList } from "@/hooks/use-presence-list";

const MODE_LABEL = { math: "Math", cs_quiz: "CS Quiz", idle: "Browsing" };
const MODE_ICON = { math: Sigma, cs_quiz: BrainCircuit };

function UserCard({ user, presence }) {
  const [requested, setRequested] = useState(false);
  const isOnline = Boolean(presence?.connected);
  const mode = presence?.mode ?? "idle";
  const ModeIcon = MODE_ICON[mode];

  async function sendRequest() {
    setRequested(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.status === "accepted" ? `You're now friends with ${user.username}` : "Friend request sent");
    } catch (err) {
      toast.error(err.message);
      setRequested(false);
    }
  }

  async function sendChallenge() {
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId, mode: mode === "idle" ? "cs_quiz" : mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Challenge sent to ${user.username}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center">
      <div className="relative">
        <button onClick={isOnline ? sendChallenge : undefined} disabled={!isOnline} className="disabled:cursor-not-allowed">
          <Avatar src={user.avatarUrl} alt={user.username} size="lg" className={isOnline ? "ring-2 ring-success" : "opacity-60"} />
        </button>
        <span
          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${
            isOnline ? "bg-success" : "bg-muted-foreground"
          }`}
        />
      </div>
      <p className="w-full truncate text-xs font-semibold">{user.username}</p>
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {isOnline && ModeIcon && <ModeIcon className="size-3" />}
        {isOnline ? MODE_LABEL[mode] ?? "Online" : "Offline"}
      </p>
      <button
        onClick={sendRequest}
        disabled={requested}
        className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-secondary disabled:opacity-50"
      >
        {requested ? <Check className="size-3" /> : <UserPlus className="size-3" />}
        {requested ? "Sent" : "Add"}
      </button>
    </div>
  );
}

export function DiscoverRow() {
  const [users, setUsers] = useState([]);
  const presenceMap = usePresenceList();

  useEffect(() => {
    fetch("/api/friends/discover")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {});
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {users.map((u) => (
        <UserCard key={u.id} user={u} presence={presenceMap[u.clerkId]} />
      ))}
    </div>
  );
}

export default DiscoverRow;