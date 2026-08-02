"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { usePresenceList } from "@/hooks/use-presence-list";
import { useChallengeResponses } from "@/hooks/use-challenge-response";
import { StoryActionMenu } from "@/components/dashboard/story-action-menu";

export function UserStoriesRow() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const presenceMap = usePresenceList();
  useChallengeResponses(user?.id);

  useEffect(() => {
    Promise.all([
      fetch("/api/friends").then((r) => r.json()),
      fetch("/api/friends/discover").then((r) => r.json()),
    ])
      .then(([friendsData, discoverData]) => {
        const friends = (friendsData.friends ?? []).map((f) => ({
          clerkId: f.clerkId,
          username: f.username,
          avatarUrl: f.avatarUrl,
        }));
        const discover = (discoverData.users ?? []).map((u) => ({
          clerkId: u.clerkId,
          username: u.username,
          avatarUrl: u.avatarUrl,
        }));
        setUsers([...friends, ...discover].slice(0, 10));
      })
      .catch(() => {});
  }, []);

  return (
    <>
    <div className="flex gap-4 overflow-x-auto overflow-y-visible pt-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center">
          <Avatar src={user?.imageUrl} alt="You" size="lg" className="ring-2 ring-primary" />
          <p className="w-full truncate text-[10px] font-semibold">You</p>
        </div>

        {users.map((u) => {
          const isOnline = Boolean(presenceMap[u.clerkId]?.connected);
          return (
            <button
              key={u.clerkId}
              onClick={() => setActiveUser(u)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
            >
              <div className="relative">
                <Avatar src={u.avatarUrl} alt={u.username} size="lg" className={isOnline ? "ring-2 ring-success" : "opacity-70"} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${
                    isOnline ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
              </div>
              <p className="w-full truncate text-[10px] font-semibold">{u.username}</p>
            </button>
          );
        })}

        <Link href="/dashboard/people" className="flex w-16 shrink-0 flex-col items-center justify-center gap-1.5 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-border">
            <ChevronRight className="size-5 text-muted-foreground" />
          </div>
          <p className="text-[10px] font-semibold text-muted-foreground">View More</p>
        </Link>
      </div>

      <StoryActionMenu user={activeUser} isOpen={Boolean(activeUser)} onClose={() => setActiveUser(null)} />
    </>
  );
}

export default UserStoriesRow;