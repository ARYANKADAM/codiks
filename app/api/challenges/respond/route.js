import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { createChallengeRoom } from "@/lib/challenge-service";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, fromClerkId, mode, action } = await req.json();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const challengeRef = adminDB.ref(realtimePaths.challenge(userId, challengeId));

  if (action === "decline") {
    const me = await currentUser();
    await challengeRef.remove();
    await adminDB.ref(realtimePaths.challengeResponse(fromClerkId, `${challengeId}_decline`)).set({
      status: "declined",
      fromUsername: me?.username || me?.firstName || "A player",
      respondedAt: Date.now(),
    });
    return NextResponse.json({ status: "declined" });
  }

  await challengeRef.remove();
  const result = await createChallengeRoom(fromClerkId, userId, mode);
  return NextResponse.json({ status: "accepted", ...result });
}