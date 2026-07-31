import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";

const SPRINT_DURATION_MS = 60 * 1000;
const START_BUFFER_MS = 4000;

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { battleId } = await params;
  const stateRef = adminDB.ref(realtimePaths.battleState(battleId));

  const result = await stateRef.transaction((current) => {
    if (current) return current;
    const startedAt = Date.now() + START_BUFFER_MS;
    return { startedAt, endsAt: startedAt + SPRINT_DURATION_MS };
  });

  const state = result.snapshot.val();

  await connectDB();
  await Battle.findOneAndUpdate(
    { _id: battleId, status: "pending" },
    { $set: { status: "active", startedAt: new Date(state.startedAt) } }
  );

  return NextResponse.json({ state });
}