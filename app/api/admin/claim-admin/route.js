import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// One-time bootstrap: only works while zero admins exist. Once someone
// claims it, this route always 409s — further promotions must go through
// an existing admin (not built today, but the gate prevents self-escalation).
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const existingAdminCount = await User.countDocuments({ role: "admin" });
  if (existingAdminCount > 0) {
    return NextResponse.json({ error: "An admin already exists." }, { status: 409 });
  }

  const me = await User.findOneAndUpdate({ clerkId: userId }, { $set: { role: "admin" } }, { new: true });
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json({ role: me.role });
}