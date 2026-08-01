import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`challenge-send:${userId}`, { limit: 10, windowMs: 60_000 });
  if (!limit.success) return NextResponse.json({ error: "Too many challenges sent — slow down." }, { status: 429 });

  const { targetClerkId, mode } = await req.json();
  if (!targetClerkId || targetClerkId === userId) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const me = await currentUser();
  const challengeId = `${userId}_${Date.now()}`;

  await adminDB.ref(realtimePaths.challenge(targetClerkId, challengeId)).set({
    challengeId,
    fromClerkId: userId,
    fromUsername: me.username || me.firstName || "A player",
    fromAvatarUrl: me.imageUrl,
    mode: mode === "math" ? "math" : "cs_quiz",
    status: "pending",
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}