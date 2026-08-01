import "server-only";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

/**
 * Single entry point for creating a notification — writes the persistent
 * MongoDB record AND pushes a real-time event to Firebase so an online
 * user's navbar bell updates instantly instead of waiting for a refetch.
 */
export async function createNotification({ userId, clerkId, type, title, message, link = null, metadata = {} }) {
  await connectDB();
  let targetClerkId = clerkId;
  let targetUserId = userId;

  if (!targetUserId && targetClerkId) {
    const user = await User.findOne({ clerkId: targetClerkId }).select("_id clerkId");
    targetUserId = user?._id;
    targetClerkId = user?.clerkId ?? targetClerkId;
  }

  if (!targetUserId) {
    throw new Error("createNotification requires either userId or clerkId");
  }

  const notif = await Notification.create({ user: targetUserId, type, title, message, link, metadata });

  if (!targetClerkId) {
    const user = await User.findById(targetUserId).select("clerkId");
    targetClerkId = user?.clerkId;
  }

  if (targetClerkId) {
    await adminDB.ref(realtimePaths.userNotifications(targetClerkId)).push({
      notificationId: String(notif._id),
      type,
      title,
      message,
      link,
      metadata,
      createdAt: Date.now(),
    });
  }

  return notif;
}

export default createNotification;