import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { BattleResult } from "@/models/BattleResult";

export async function GET(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { battleId } = await params;
  await connectDB();

  const battle = await Battle.findById(battleId).populate("participants.user", "clerkId username avatarUrl");
  if (!battle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = battle.participants.some((p) => p.user.clerkId === userId);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (battle.status !== "completed") {
    return NextResponse.json({ status: battle.status });
  }

  const results = await BattleResult.find({ battle: battleId }).populate("user", "clerkId username avatarUrl");

 const sessionSnap = await import("@/lib/firebase-admin").then(({ adminDB }) =>
    adminDB.ref(`battles/${battleId}/state`).get()
  );

  return NextResponse.json({
    status: "completed",
    winnerId: battle.winner ? String(battle.winner) : null,
    reason: sessionSnap.val()?.reason ?? "solved",
    results: results.map((r) => ({
      userId: String(r.user._id),
      clerkId: r.user.clerkId,
      username: r.user.username,
      avatarUrl: r.user.avatarUrl,
      questionsSolved: r.questionsSolved,
      score: r.score,
      ratingChange: r.ratingChange,
      placement: r.placement,
    })),
  });
}