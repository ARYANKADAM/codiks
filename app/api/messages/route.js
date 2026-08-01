import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { buildConversationId } from "@/lib/chat-realtime";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";
import { ChatMessage } from "@/models/ChatMessage";
import { Notification } from "@/models/Notification";

function getOtherFromFriendship(meId, relation) {
  const isRequester = String(relation.requester._id) === String(meId);
  return isRequester ? relation.recipient : relation.requester;
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const withClerkId = String(req.nextUrl.searchParams.get("with") || "").trim();

    await connectDB();
    const me = await User.findOne({ clerkId: userId }).select("_id clerkId username avatarUrl");
    if (!me) return NextResponse.json({ me: null, inbox: [], messages: [] });

    const relations = await Friendship.find({
      status: "accepted",
      $or: [{ requester: me._id }, { recipient: me._id }],
    })
      .populate("requester", "clerkId username avatarUrl")
      .populate("recipient", "clerkId username avatarUrl");

    const friends = relations
      .map((relation) => getOtherFromFriendship(me._id, relation))
      .filter(Boolean)
      .map((user) => ({
        clerkId: user.clerkId,
        username: user.username,
        avatarUrl: user.avatarUrl || null,
      }));

    const friendIdSet = new Set(friends.map((f) => f.clerkId));

    if (withClerkId) {
      if (!friendIdSet.has(withClerkId)) {
        return NextResponse.json({ error: "You can only message accepted friends" }, { status: 403 });
      }

      const conversationId = buildConversationId(me.clerkId, withClerkId);
      const docs = await ChatMessage.find({ conversationId }).sort({ createdAtMs: 1 }).limit(300).lean();
      const messages = docs.map((m) => ({
        id: String(m._id),
        conversationId: m.conversationId,
        senderClerkId: m.senderClerkId,
        senderUsername: m.senderUsername,
        senderAvatarUrl: m.senderAvatarUrl,
        recipientClerkId: m.recipientClerkId,
        kind: m.kind ?? "text",
        resultData: m.resultData ?? null,
        text: m.text,
        createdAt: m.createdAtMs,
      }));

      return NextResponse.json({
        me: { clerkId: me.clerkId, username: me.username, avatarUrl: me.avatarUrl || null },
        friends,
        messages,
      });
    }

    const recentDocs = await ChatMessage.find({
      $or: [{ senderClerkId: me.clerkId }, { recipientClerkId: me.clerkId }],
    })
      .sort({ createdAtMs: -1 })
      .limit(1000)
      .lean();

    const previewByConversation = new Map();
    for (const doc of recentDocs) {
      if (!previewByConversation.has(doc.conversationId)) {
        previewByConversation.set(doc.conversationId, {
          lastMessageText: doc.text,
          lastMessageAt: doc.createdAtMs,
          lastMessageSenderId: doc.senderClerkId,
          kind: doc.kind ?? "text",
          resultData: doc.resultData ?? null,
        });
      }
    }

    const inbox = friends
      .map((friend) => {
        const conversationId = buildConversationId(me.clerkId, friend.clerkId);
        const preview = previewByConversation.get(conversationId);
        return {
          conversationId,
          otherClerkId: friend.clerkId,
          otherUsername: friend.username,
          otherAvatarUrl: friend.avatarUrl,
          kind: preview?.kind ?? "text",
          resultData: preview?.resultData ?? null,
          lastMessageText: preview?.lastMessageText ?? null,
          lastMessageAt: preview?.lastMessageAt ?? 0,
          lastMessageSenderId: preview?.lastMessageSenderId ?? null,
        };
      })
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    return NextResponse.json({
      me: { clerkId: me.clerkId, username: me.username, avatarUrl: me.avatarUrl || null },
      inbox,
    });
  } catch (err) {
    console.error("GET /api/messages failed:", err);
    return NextResponse.json({ error: err?.message || "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const targetClerkId = String(body?.targetClerkId || "").trim();
    const text = String(body?.text || "").trim();

    if (!targetClerkId || targetClerkId === userId) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    await connectDB();
    const [me, target] = await Promise.all([
      User.findOne({ clerkId: userId }).select("_id clerkId username avatarUrl"),
      User.findOne({ clerkId: targetClerkId }).select("_id clerkId username avatarUrl"),
    ]);

    if (!me || !target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const relation = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: me._id, recipient: target._id },
        { requester: target._id, recipient: me._id },
      ],
    }).select("_id");

    if (!relation) {
      return NextResponse.json({ error: "You can only message accepted friends" }, { status: 403 });
    }

    const conversationId = buildConversationId(me.clerkId, target.clerkId);
    const createdAt = Date.now();

    const messageRef = adminDB.ref(realtimePaths.chatMessagesByConversation(conversationId)).push();
    const messageId = messageRef.key;

    const message = {
      conversationId,
      text,
      senderClerkId: me.clerkId,
      senderUsername: me.username,
      senderAvatarUrl: me.avatarUrl || null,
      recipientClerkId: target.clerkId,
      createdAt,
    };

    const saved = await ChatMessage.create({
      conversationId,
      senderClerkId: me.clerkId,
      recipientClerkId: target.clerkId,
      senderUsername: me.username,
      senderAvatarUrl: me.avatarUrl || null,
      kind: "text",
      text,
      createdAtMs: createdAt,
    });

    await Promise.all([
      messageRef.set({ id: messageRef.key, ...message }),
      Notification.create({
        user: target._id,
        type: "system",
        title: `New message from ${me.username}`,
        message: text.slice(0, 140),
        link: `/chat?with=${target.clerkId}`,
        metadata: {
          category: "chat_message",
          conversationId,
          senderClerkId: me.clerkId,
        },
      }),
      adminDB.ref(realtimePaths.userNotifications(target.clerkId)).push({
        type: "chat_message",
        title: "New message",
        message: `${me.username}: ${text.slice(0, 80)}`,
        conversationId,
        senderClerkId: me.clerkId,
        metadata: {
          category: "chat_message",
          conversationId,
          senderClerkId: me.clerkId,
        },
        createdAt,
      }),
    ]);

    return NextResponse.json({
      message: {
        id: String(saved._id),
        conversationId,
        text,
        senderClerkId: me.clerkId,
        senderUsername: me.username,
        senderAvatarUrl: me.avatarUrl || null,
        recipientClerkId: target.clerkId,
        kind: "text",
        resultData: null,
        createdAt,
      },
    });
  } catch (err) {
    console.error("POST /api/messages failed:", err);
    return NextResponse.json({ error: err?.message || "Failed to send message" }, { status: 500 });
  }
}
