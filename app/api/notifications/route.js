import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { VISIBLE_NOTIFICATION_TYPES } from "@/lib/notification-visibility";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ clerkId: userId }).select("_id");
  if (!me) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: me._id, type: { $in: VISIBLE_NOTIFICATION_TYPES } }).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ user: me._id, isRead: false, type: { $in: VISIBLE_NOTIFICATION_TYPES } }),
  ]);

  const unreadChatCount = await Notification.countDocuments({
    user: me._id,
    type: "system",
    "metadata.category": "chat_message",
    isRead: false,
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    unreadCount,
    unreadChatCount,
  });
}