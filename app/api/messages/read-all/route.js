import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ clerkId: userId }).select("_id");
  if (!me) return NextResponse.json({ ok: true });

  await Notification.updateMany(
    { user: me._id, type: "system", "metadata.category": "chat_message", isRead: false },
    { $set: { isRead: true } }
  );

  return NextResponse.json({ ok: true });
}