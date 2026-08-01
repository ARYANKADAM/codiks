import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";
import { createNotification } from "@/lib/notification-service";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetClerkId } = await req.json();
  if (!targetClerkId || targetClerkId === userId) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  await connectDB();
  const [me, target] = await Promise.all([
    User.findOne({ clerkId: userId }),
    User.findOne({ clerkId: targetClerkId }),
  ]);
  if (!me || !target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await Friendship.findOne({
    $or: [
      { requester: me._id, recipient: target._id },
      { requester: target._id, recipient: me._id },
    ],
  });

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }
    if (existing.status === "pending" && String(existing.requester) === String(target._id)) {
      // They already requested us — treat this as accepting their request.
      existing.status = "accepted";
      await existing.save();
      await createNotification({
        userId: target._id,
        clerkId: target.clerkId,
        type: "friend_request",
        title: "Friend request accepted",
        message: `${me.username} accepted your friend request.`,
        link: "/dashboard/profile",
      });
      return NextResponse.json({ status: "accepted" });
    }
    return NextResponse.json({ error: "Request already pending" }, { status: 409 });
  }

  await Friendship.create({ requester: me._id, recipient: target._id, status: "pending" });

  await createNotification({
    userId: target._id,
    clerkId: target.clerkId,
    type: "friend_request",
    title: "New friend request",
    message: `${me.username} wants to be your friend.`,
    link: "/dashboard/profile",
  });

  return NextResponse.json({ status: "pending" });
}