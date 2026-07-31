import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { User } from "@/models/User";
import { settleBattle } from "@/lib/battle-settlement";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { battleId } = await params;
  await connectDB();

  const [battle, me] = await Promise.all([
    Battle.findById(battleId).populate("participants.user", "clerkId"),
    User.findOne({ clerkId: userId }),
  ]);

  if (!battle || !me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = battle.participants.some((p) => String(p.user._id) === String(me._id));
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const opponent = battle.participants.find((p) => String(p.user._id) !== String(me._id));
  if (!opponent) return NextResponse.json({ error: "No opponent to award the win to" }, { status: 400 });

  const result = await settleBattle(battleId, { forcedWinnerId: opponent.user._id, reason: "forfeit" });
  if (!result) return NextResponse.json({ error: "Could not settle battle" }, { status: 500 });

  return NextResponse.json(result);
}