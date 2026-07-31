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
  const notif = await Notification.create({ user: userId, type, title, message, link, metadata });

  let targetClerkId = clerkId;
  if (!targetClerkId) {
    const user = await User.findById(userId).select("clerkId");
    targetClerkId = user?.clerkId;
  }

  if (targetClerkId) {
    await adminDB.ref(realtimePaths.userNotifications(targetClerkId)).push({
      notificationId: String(notif._id),
      type,
      title,
      message,
      link,
      createdAt: Date.now(),
    });
  }

  return notif;
}

export default createNotification;