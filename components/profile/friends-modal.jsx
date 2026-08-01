"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Sigma, BrainCircuit, UserPlus, Users, X as XIcon } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/shared/dialog-overlay";
import { EmptyState } from "@/components/shared/empty-state";
import { usePresenceList } from "@/hooks/use-presence-list";

const MODE_LABEL = { math: "Math", cs_quiz: "CS Quiz", idle: "Browsing" };
const MODE_ICON = { math: Sigma, cs_quiz: BrainCircuit };

function DiscoverCard({ user, presence, onAdded }) {
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
      onAdded?.();
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
    <div className="flex items-center gap-3 rounded-lg border border-border p-2">
      <button onClick={isOnline ? sendChallenge : undefined} disabled={!isOnline} className="disabled:cursor-not-allowed">
        <Avatar src={user.avatarUrl} alt={user.username} size="sm" className={isOnline ? "ring-2 ring-success" : "opacity-60"} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.username}</p>
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {isOnline && ModeIcon && <ModeIcon className="size-3" />}
          {isOnline ? MODE_LABEL[mode] ?? "Online" : "Offline"}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={sendRequest} disabled={requested}>
        {requested ? <Check className="size-3" /> : <UserPlus className="size-3" />}
      </Button>
    </div>
  );
}

export function FriendsModal({ isOpen, onClose }) {
  const [tab, setTab] = useState("friends");
  const [friendsData, setFriendsData] = useState({ friends: [], incoming: [], outgoing: [] });
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const presenceMap = usePresenceList();

  function loadFriends() {
    fetch("/api/friends").then((r) => r.json()).then(setFriendsData).catch(() => {});
  }
  function loadDiscover() {
    fetch("/api/friends/discover").then((r) => r.json()).then((d) => setDiscoverUsers(d.users ?? [])).catch(() => {});
  }

  useEffect(() => {
    if (!isOpen) return;
    loadFriends();
    loadDiscover();
  }, [isOpen]);

  async function respond(requestId, action) {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(action === "accept" ? "Friend request accepted" : "Request declined");
      loadFriends();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <DialogOverlay isOpen={isOpen} onClose={onClose} labelledBy="friends-modal-title">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="friends-modal-title" className="text-lg font-bold">
            Friends
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <XIcon className="size-4" />
          </Button>
        </div>

        <div className="mb-4 flex gap-6 border-b border-border">
          {["friends", "discover"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 pb-2 text-sm font-semibold capitalize transition-colors ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {tab === "friends" ? (
            <>
              {friendsData.incoming.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Pending requests</p>
                  {friendsData.incoming.map((r) => (
                    <div key={r.requestId} className="flex items-center gap-3 rounded-lg border border-border p-2">
                      <Avatar src={r.avatarUrl} alt={r.username} size="sm" />
                      <span className="flex-1 truncate text-sm font-medium">{r.username}</span>
                      <Button size="icon" variant="ghost" onClick={() => respond(r.requestId, "accept")}>
                        <Check className="size-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => respond(r.requestId, "decline")}>
                        <XIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {friendsData.friends.length === 0 ? (
                <EmptyState icon={Users} title="No friends yet" description="Add players from the Discover tab." className="border-none p-6" />
              ) : (
                friendsData.friends.map((f) => (
                  <div key={f.requestId} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <Avatar src={f.avatarUrl} alt={f.username} size="sm" />
                    <span className="truncate text-sm font-medium">{f.username}</span>
                  </div>
                ))
              )}
            </>
          ) : discoverUsers.length === 0 ? (
            <EmptyState icon={UserPlus} title="No suggestions right now" className="border-none p-6" />
          ) : (
            discoverUsers.map((u) => <DiscoverCard key={u.id} user={u} presence={presenceMap[u.clerkId]} onAdded={loadDiscover} />)
          )}
        </div>
      </div>
    </DialogOverlay>
  );
}

export default FriendsModal;