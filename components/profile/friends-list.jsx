"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export function FriendsList() {
  const [data, setData] = useState({ friends: [], incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    fetch("/api/friends")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

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
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends ({data.friends.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.incoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Pending requests</p>
            {data.incoming.map((r) => (
              <div key={r.requestId} className="flex items-center gap-3 rounded-lg border border-border p-2">
                <Avatar src={r.avatarUrl} alt={r.username} size="sm" />
                <span className="flex-1 truncate text-sm font-medium">{r.username}</span>
                <Button size="icon" variant="ghost" onClick={() => respond(r.requestId, "accept")}>
                  <Check className="size-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => respond(r.requestId, "decline")}>
                  <X className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {data.friends.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No friends yet"
            description="Add players from the dashboard to duel them directly."
            className="border-none p-6"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {data.friends.map((f) => (
              <div key={f.requestId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <Avatar src={f.avatarUrl} alt={f.username} size="sm" />
                <span className="truncate text-xs font-medium">{f.username}</span>
              </div>
            ))}
          </div>
        )}

        {data.outgoing.length > 0 && (
          <p className="text-xs text-muted-foreground">{data.outgoing.length} request(s) awaiting response.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default FriendsList;