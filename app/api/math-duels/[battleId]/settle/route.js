import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { settleMathDuel } from "@/lib/math-duel-settlement";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { battleId } = await params;
  const result = await settleMathDuel(battleId);
  if (!result) return NextResponse.json({ error: "Battle not found" }, { status: 404 });

  return NextResponse.json(result);
}