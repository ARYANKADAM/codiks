"use client";

function key(conversationId) {
  return `chat_read_${conversationId}`;
}

export function getConversationReadAt(conversationId) {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(key(conversationId));
  return stored ? Number(stored) : 0;
}

export function markConversationRead(conversationId, timestamp = Date.now()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(conversationId), String(timestamp));
}

export function isThreadUnread(thread, myClerkId) {
  if (!thread.lastMessageSenderId || thread.lastMessageSenderId === myClerkId) return false;
  return (thread.lastMessageAt ?? 0) > getConversationReadAt(thread.conversationId);
}