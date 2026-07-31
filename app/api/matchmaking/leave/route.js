import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await adminDB.ref(realtimePaths.matchmakingEntry(userId)).remove();
  return NextResponse.json({ status: "left" });
}