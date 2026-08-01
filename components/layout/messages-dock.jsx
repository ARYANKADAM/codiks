"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Search, Send, X } from "lucide-react";
import { off, onChildAdded, ref } from "firebase/database";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";
import { cn } from "@/lib/utils";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessagesDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [me, setMe] = useState(null);
  const [inboxEntries, setInboxEntries] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const mountedAt = useRef(Date.now());

  async function fetchInbox(silent = false) {
    try {
      const res = await fetch("/api/messages");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || "Could not load inbox");

      setMe(data?.me?.clerkId ? data.me : null);
      setFriends(Array.isArray(data?.inbox) ? data.inbox : []);
      setInboxEntries(Array.isArray(data?.inbox) ? data.inbox : []);
    } catch (err) {
      if (!silent) toast.error(err?.message || "Could not load inbox");
    }
  }

  async function fetchThread(targetClerkId, silent = false) {
    if (!targetClerkId) {
      setActiveMessages([]);
      return;
    }

    try {
      const res = await fetch(`/api/messages?with=${encodeURIComponent(targetClerkId)}`);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || "Could not load chat");

      setActiveMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      if (!silent) toast.error(err?.message || "Could not load chat");
    }
  }

  useEffect(() => {
    let mounted = true;

    fetchInbox(true)
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!me?.clerkId) return;

    const notifRef = ref(realtimeDB, realtimePaths.userNotifications(me.clerkId));
    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data || data.createdAt < mountedAt.current) return;
      if (data.type !== "chat_message") return;

      fetchInbox(true);
      if (selectedFriendId && data.senderClerkId === selectedFriendId) {
        fetchThread(selectedFriendId, true);
      }
    };

    onChildAdded(notifRef, handleChildAdded);
    return () => off(notifRef, "child_added", handleChildAdded);
  }, [me?.clerkId, selectedFriendId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedFriendId) {
      setActiveMessages([]);
      return;
    }
    fetchThread(selectedFriendId, true);
  }, [selectedFriendId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFriends = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? friends.filter((friend) => friend.otherUsername?.toLowerCase().includes(term))
      : friends;
  }, [friends, query]);

  const selectedFriend = useMemo(
    () => inboxEntries.find((friend) => friend.otherClerkId === selectedFriendId) ?? null,
    [inboxEntries, selectedFriendId]
  );

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!selectedFriend || !text || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: selectedFriend.otherClerkId, text }),
      });

      const raw = await res.text();
      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { error: raw.slice(0, 120) };
        }
      }
      if (!res.ok) throw new Error(data?.error || "Could not send message");
      setActiveMessages((prev) => [...prev, data.message]);
      fetchInbox(true);
      setDraft("");
    } catch (err) {
      toast.error(err?.message || "Could not send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-lg transition hover:bg-secondary sm:bottom-6 sm:right-6"
        aria-expanded={isOpen}
        aria-controls="dashboard-messages-dock"
      >
        <MessageSquare className="size-4 text-primary" />
        <span className="text-sm font-semibold">Messages</span>
        {filteredFriends.length > 0 && (
          <div className="hidden -space-x-2 sm:flex">
            {filteredFriends.slice(0, 3).map((friend) => (
              <Avatar
                key={friend.otherClerkId}
                src={friend.otherAvatarUrl}
                alt={friend.otherUsername}
                size="xs"
                className="ring-2 ring-card"
              />
            ))}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          id="dashboard-messages-dock"
          className="fixed bottom-20 right-4 z-50 h-[min(78vh,620px)] w-[min(94vw,900px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:bottom-24 sm:right-6"
        >
          <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
            <div className="border-b border-border md:border-b-0 md:border-r">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-wide">Messages</p>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close messages">
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search user..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="h-[calc(100%-122px)] overflow-y-auto p-2">
                {isLoading ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Loading friends...</p>
                ) : filteredFriends.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">No friends available for chat yet.</p>
                ) : (
                  filteredFriends.map((friend) => {
                    const preview = friend;
                    return (
                      <button
                        type="button"
                        key={friend.otherClerkId}
                        className={cn(
                          "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                          selectedFriendId === friend.otherClerkId ? "bg-secondary" : "hover:bg-secondary/60"
                        )}
                        onClick={() => setSelectedFriendId(friend.otherClerkId)}
                      >
                        <Avatar src={friend.otherAvatarUrl} alt={friend.otherUsername} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{friend.otherUsername}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {preview.lastMessageText ?? "No messages yet"}
                          </p>
                        </div>
                        {preview.lastMessageAt ? (
                          <span className="text-[10px] text-muted-foreground">{formatTime(preview.lastMessageAt)}</span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex h-full flex-col">
              {!selectedFriend ? (
                <div className="grid h-full place-items-center px-8 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary">
                      <MessageSquare className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-display uppercase">No Chat Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a conversation to start chatting with your friends.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={selectedFriend.otherAvatarUrl} alt={selectedFriend.otherUsername} size="sm" />
                      <div>
                        <p className="text-sm font-semibold">{selectedFriend.otherUsername}</p>
                        <p className="text-xs text-muted-foreground">Direct message</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto p-4">
                    {activeMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages yet. Send the first one.</p>
                    ) : (
                      activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                            message.senderClerkId === me?.clerkId
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          )}
                        >
                          <p>{message.text}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              message.senderClerkId === me?.clerkId ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="border-t border-border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={`Message ${selectedFriend.otherUsername}`}
                      />
                      <Button type="submit" size="icon" aria-label="Send message" disabled={!draft.trim() || isSending}>
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessagesDock;
