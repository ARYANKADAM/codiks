import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// Dev/testing convenience: lets the signed-in user demote *themselves*
// back to a regular user. Not exposed in any UI.
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOneAndUpdate({ clerkId: userId }, { $set: { role: "user" } }, { new: true });
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json({ role: me.role });
}