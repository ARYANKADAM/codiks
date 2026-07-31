import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const mode = body.mode === "math" ? "math" : "coding";

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).select("rating mathRating").lean();
  if (!user) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  await adminDB.ref(realtimePaths.matchmakingAssignment(userId)).remove();

  await adminDB.ref(realtimePaths.matchmakingEntry(userId)).set({
    rating: (mode === "math" ? user.mathRating : user.rating) ?? 1200,
    mode,
    status: "waiting",
    joinedAt: Date.now(),
  });

  return NextResponse.json({ status: "queued" });
}