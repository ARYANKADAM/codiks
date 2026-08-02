import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";
import { createNotification } from "@/lib/notification-service";
import { createNotification } from "@/lib/notification-service";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, action } = await req.json();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectDB();
  const me = await User.findOne({ clerkId: userId }).select("_id username");
  const request = await Friendship.findById(requestId).populate("requester", "clerkId username");
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(request.recipient) !== String(me._id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "decline") {
    await request.deleteOne();
    await createNotification({
      userId: request.requester._id,
      clerkId: request.requester.clerkId,
      type: "friend_request",
      title: "Friend request declined",
      message: `${me.username} declined your friend request.`,
      link: "/dashboard/profile",
    });
    return NextResponse.json({ status: "declined" });
  }

  request.status = "accepted";
  await request.save();

  await createNotification({
    userId: request.requester._id,
    clerkId: request.requester.clerkId,
    type: "friend_request",
    title: "Friend request accepted",
    message: `${me.username} accepted your friend request.`,
    link: "/dashboard/profile",
  });

  return NextResponse.json({ status: "accepted" });
}