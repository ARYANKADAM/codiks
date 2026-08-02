import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetClerkId } = await req.json();
  if (!targetClerkId) return NextResponse.json({ error: "Invalid target" }, { status: 400 });

  await connectDB();
  const [me, target] = await Promise.all([
    User.findOne({ clerkId: userId }).select("_id"),
    User.findOne({ clerkId: targetClerkId }).select("_id"),
  ]);
  if (!me || !target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const relation = await Friendship.findOneAndDelete({
    $or: [
      { requester: me._id, recipient: target._id },
      { requester: target._id, recipient: me._id },
    ],
  });

  if (!relation) return NextResponse.json({ error: "No relationship found" }, { status: 404 });
  return NextResponse.json({ status: "removed" });
}