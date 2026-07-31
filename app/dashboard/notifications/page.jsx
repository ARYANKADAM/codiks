import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { NotificationList } from "@/components/notifications/notification-list";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { userId } = await auth();
  await connectDB();
  const me = await User.findOne({ clerkId: userId }).select("_id");
  const notifications = me
    ? await Notification.find({ user: me._id }).sort({ createdAt: -1 }).limit(50).lean()
    : [];

  const serialized = notifications.map((n) => ({
    id: String(n._id),
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Battle results, achievements, and more.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <NotificationList notifications={serialized} />
        </CardContent>
      </Card>
    </div>
  );
}