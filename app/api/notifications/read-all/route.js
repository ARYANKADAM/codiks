import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { VISIBLE_NOTIFICATION_TYPES } from "@/lib/notification-visibility";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ clerkId: userId }).select("_id");
 await Notification.updateMany(
    { user: me._id, isRead: false, type: { $in: VISIBLE_NOTIFICATION_TYPES } },
    { $set: { isRead: true } }
  );
  return NextResponse.json({ ok: true });
}