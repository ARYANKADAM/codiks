"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Search, Send, MoreVertical, Sparkles, Shuffle, Trophy, MessageSquare } from "lucide-react";
import { ref, onChildAdded, off } from "firebase/database";
import { toast } from "sonner";
import { SidebarProvider, useSidebar } from "@/components/providers/sidebar-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopbar } from "@/components/layout/mobile-topbar";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { realtimeDB } from "@/lib/firebase";
import { realtimePaths } from "@/lib/realtime-paths";
import { buildConversationId } from "@/lib/chat-realtime";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChallengeListener } from "@/components/friends/challenge-listener";
import { BattleResultCard } from "@/components/chat/battle-result-card";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { Suspense } from "react";
import { useNotificationsContext } from "@/components/providers/notifications-provider";
import { isThreadUnread, markConversationRead } from "@/hooks/use-chat-read-state";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { useRouter } from "next/navigation";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function ChatShell() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [selectedClerkId, setSelectedClerkId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [isChallengeMenuOpen, setIsChallengeMenuOpen] = useState(false);
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);
  const messagesEndRef = useRef(null);
  useMatchmaking(user?.id);

  const unreadCount = inbox.filter((thread) => thread.lastMessageSenderId && thread.lastMessageSenderId !== me?.clerkId).length;
  const selectedThread = useMemo(
    () => inbox.find((thread) => thread.otherClerkId === selectedClerkId) ?? null,
    [inbox, selectedClerkId]
  );

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMe(data?.me ?? null);
      setInbox(Array.isArray(data?.inbox) ? data.inbox : []);
    } catch (err) {
      toast.error(err?.message || "Could not load messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (clerkId) => {
    if (!clerkId) {
      setActiveMessages([]);
      return;
    }

    try {
      const res = await fetch(`/api/messages?with=${encodeURIComponent(clerkId)}`);
      const data = await res.json();
      setActiveMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      toast.error(err?.message || "Could not load conversation");
    }
  }, []);

  const { version } = useNotificationsContext();
  useEffect(() => {
    if (version > 0) loadInbox();
  }, [version, loadInbox]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    fetch("/api/messages/read-all", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const initial = searchParams.get("with");
    if (initial) setSelectedClerkId(initial);
  }, [searchParams]);

  useEffect(() => {
    if (!me?.clerkId) return;
    const notifRef = ref(realtimeDB, realtimePaths.userNotifications(me.clerkId));
    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      if (data.metadata?.category !== "chat_message" && data.type !== "chat_message") return;
      loadInbox();
      const activeConversationId = selectedClerkId ? buildConversationId(me.clerkId, selectedClerkId) : null;
      if (data.metadata?.conversationId === activeConversationId || (data.senderClerkId && data.senderClerkId === selectedClerkId)) {
        loadThread(selectedClerkId);
      }
    };

    onChildAdded(notifRef, handleChildAdded);
    return () => off(notifRef, "child_added", handleChildAdded);
  }, [me?.clerkId, selectedClerkId, loadInbox, loadThread]);

  useEffect(() => {
    if (!selectedClerkId) {
      setActiveMessages([]);
      return;
    }
    loadThread(selectedClerkId);
  }, [selectedClerkId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages, selectedClerkId]);

  const filteredThreads = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = inbox.filter((thread) => thread.otherUsername?.toLowerCase().includes(term));

    if (tab === "groups") return [];

    return [...base].sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  }, [inbox, query, tab]);

  const isMobileThreadOpen = !isDesktop && Boolean(selectedThread);
  const showListPane = isDesktop || !isMobileThreadOpen;

  async function sendChallenge(mode) {
    if (!selectedThread || isSendingChallenge) return;

    setIsSendingChallenge(true);
    try {
      const res = await fetch("/api/challenges/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: selectedThread.otherClerkId, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not send challenge");
      toast.success(`Challenge sent to ${selectedThread.otherUsername}`);
      setIsChallengeMenuOpen(false);
    } catch (err) {
      toast.error(err?.message || "Could not send challenge");
    } finally {
      setIsSendingChallenge(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedThread || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetClerkId: selectedThread.otherClerkId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not send message");
      setDraft("");
      setActiveMessages((prev) => [...prev, data.message]);
      loadInbox();
    } catch (err) {
      toast.error(err?.message || "Could not send message");
    } finally {
      setIsSending(false);
    }
  }

  const emptyState = (
    <div className="grid h-full place-items-center px-6 py-16 text-center lg:px-10">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary/80 shadow-inner">
          <MessageSquare className="size-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">No Chat Selected</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Select a conversation to start chatting with your friends.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={user?.publicMetadata?.role === "admin"} user={user ? {
        fullName: user.fullName || user.username,
        username: user.username,
      } : null} />
      <MobileTopbar />
      <ChallengeListener />

      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="h-[calc(100vh-3.5rem)] p-3 sm:p-4 lg:h-[calc(100vh-1.5rem)] lg:p-6">
          <div className="mx-auto h-full max-w-[1600px]">
            <div className="grid h-full overflow-hidden rounded-[28px] border border-border bg-card/70 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm lg:grid-cols-[360px_minmax(0,1fr)]">
              {showListPane && (
                <aside className={cn("flex h-full min-h-0 flex-col border-border bg-background/40", isDesktop ? "border-r" : "")}>
                  <div className="border-b border-border p-4 sm:p-5">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search User..." className="h-12 rounded-2xl pl-10" />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button variant={tab === "all" ? "brand" : "outline"} size="sm" onClick={() => setTab("all")}>ALL</Button>
                      <Button variant={tab === "groups" ? "brand" : "outline"} size="sm" onClick={() => setTab("groups")}>GROUPS</Button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                    {isLoading ? (
                      <div className="space-y-4 p-3 text-sm text-muted-foreground">Loading chats...</div>
                    ) : tab === "groups" ? (
                      <div className="grid place-items-center rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                        Group chats are coming soon.
                      </div>
                    ) : filteredThreads.length === 0 ? (
                      <div className="grid place-items-center rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                        No conversations yet.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredThreads.map((thread) => {
                          const isActive = selectedClerkId === thread.otherClerkId;
                          return (
                            <button
                              key={thread.conversationId}
                              type="button"
                              onClick={() => {
                                setSelectedClerkId(thread.otherClerkId);
                                markConversationRead(thread.conversationId);
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                                isActive ? "bg-secondary/90" : "hover:bg-secondary/60"
                              )}
                            >
                              <Avatar src={thread.otherAvatarUrl} alt={thread.otherUsername} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="truncate text-sm font-semibold">{thread.otherUsername}</p>
                                  <div className="flex shrink-0 items-center gap-1.5">
                                    {isThreadUnread(thread, me?.clerkId) && (
                                      <span className="size-2 rounded-full bg-destructive" aria-label="Unread" />
                                    )}
                                    <span className="text-[11px] text-muted-foreground">
                                      {thread.lastMessageAt ? formatTime(thread.lastMessageAt) : ""}
                                    </span>
                                  </div>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {thread.lastMessageText || "No messages yet"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative border-t border-border p-4">
                    <button
                      type="button"
                      className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-foreground shadow-lg transition hover:scale-105"
                      aria-label="Create conversation"
                    >
                      <span className="text-xl font-bold">+ </span>
                    </button>
                  </div>
                </aside>
              )}

              {(isDesktop || isMobileThreadOpen) ? (
                <section className="flex h-full min-h-0 flex-col bg-background/20">
                  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Back to dashboard"
                        className="shrink-0"
                        onClick={() => router.push("/dashboard")}
                      >
                        <ArrowLeft className="size-4" />
                      </Button>
                      <Avatar src={selectedThread?.otherAvatarUrl} alt={selectedThread?.otherUsername} size="sm" className="shrink-0 sm:hidden" />
                      <Avatar src={selectedThread?.otherAvatarUrl} alt={selectedThread?.otherUsername} size="md" className="hidden shrink-0 sm:block" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{selectedThread?.otherUsername}</p>
                        <p className="hidden text-xs text-muted-foreground sm:block">Direct message</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChallengeMenuOpen(true)}
                        disabled={!selectedThread}
                        className="flex items-center gap-1.5 rounded-full border border-primary/60 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50 sm:px-4"
                      >
                        <Sparkles className="size-3.5" /><span className="hidden sm:inline">Challenge</span>
                      </button>
                      <Button variant="outline" size="icon" aria-label="More options"><MoreVertical className="size-4" /></Button>
                    </div>
                  </div>

                  {!selectedThread ? (
                    emptyState
                  ) : (
                    <>
                      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-6 lg:px-8">
                        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                          {activeMessages.length === 0 ? (
                            <div className="grid min-h-[30vh] place-items-center rounded-3xl border border-dashed border-border text-sm text-muted-foreground">
                              No messages yet. Send the first one.
                            </div>
                          ) : (
                            activeMessages.map((message, index) => {
                              const prevMessage = activeMessages[index - 1];
                              const showDateDivider =
                                !prevMessage ||
                                formatDateLabel(prevMessage.createdAt) !== formatDateLabel(message.createdAt);

                              if (message.kind === "battle_result") {
                                return (
                                  <div key={message.id} className="contents">
                                    {showDateDivider && (
                                      <div className="flex justify-center py-1">
                                        <span className="rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                                          {formatDateLabel(message.createdAt)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex w-full min-w-0 justify-center py-2">
                                      <BattleResultCard resultData={message.resultData} currentUserId={me?.clerkId} />
                                    </div>
                                  </div>
                                );
                              }

                              const isMine = message.senderClerkId === me?.clerkId;
                              return (
                                <div key={message.id} className="contents">
                                  {showDateDivider && (
                                    <div className="flex justify-center py-1">
                                      <span className="rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                                        {formatDateLabel(message.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                  <div className={cn("flex w-full min-w-0", isMine ? "justify-end" : "justify-start")}>
                                    <div
                                      className={cn(
                                        "min-w-0 max-w-[80%] break-words rounded-2xl border px-3.5 py-2.5 sm:max-w-[min(65%,32rem)] sm:rounded-[20px] sm:px-4 sm:py-3",
                                        isMine
                                          ? "border-border/80 bg-secondary/40 text-foreground"
                                          : "border-border/60 bg-secondary/20 text-foreground"
                                      )}
                                    >
                                      <p className="whitespace-pre-wrap break-words text-[13px] leading-6 sm:text-sm">{message.text}</p>
                                      <div className="mt-1.5 text-right text-[10.5px] text-muted-foreground/80">
                                        {formatTime(message.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      <div className="border-t border-border/70 bg-background/60 p-3 sm:p-4">
                        <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
                          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                            <button
                              type="button"
                              onClick={() => setIsChallengeMenuOpen(true)}
                              disabled={!selectedThread}
                              className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/60 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                            >
                              <Trophy className="size-3.5" />Challenge
                            </button>
                            <button
                              type="button"
                              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary/40"
                            >
                              <Shuffle className="size-3.5" />Random
                            </button>
                            <button
                              type="button"
                              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary/40"
                            >
                              <Sparkles className="size-3.5" />GG
                            </button>
                          </div>

                          <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/20 px-4 py-2">
                            <Input
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              placeholder="Write your message"
                              className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              className="size-9 shrink-0 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                              disabled={!draft.trim() || isSending}
                              aria-label="Send message"
                            >
                              <Send className="size-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {isChallengeMenuOpen && selectedThread && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 px-4 py-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Challenge</p>
                <h3 className="font-display text-2xl uppercase">Send to {selectedThread.otherUsername}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsChallengeMenuOpen(false)} aria-label="Close challenge menu">
                <ArrowLeft className="size-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto flex-col items-start justify-start gap-1 rounded-2xl p-4 text-left"
                onClick={() => sendChallenge("math")}
                disabled={isSendingChallenge}
              >
                <span className="text-base font-semibold">Math Duel</span>
                <span className="text-xs text-muted-foreground">Send a math challenge request</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-start justify-start gap-1 rounded-2xl p-4 text-left"
                onClick={() => sendChallenge("cs_quiz")}
                disabled={isSendingChallenge}
              >
                <span className="text-base font-semibold">CS Quiz Duel</span>
                <span className="text-xs text-muted-foreground">Send a quiz challenge request</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatPage() {
  const { user } = useUser();
  return (
    <SidebarProvider>
      <NotificationsProvider clerkId={user?.id}>
        <Suspense fallback={null}>
          <ChatShell />
        </Suspense>
      </NotificationsProvider>
    </SidebarProvider>
  );
}
export default ChatPage;