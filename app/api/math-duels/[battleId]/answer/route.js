import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { User } from "@/models/User";
import { MathAttempt } from "@/models/MathAttempt";
import { getMathQuestion } from "@/lib/math-question-generator";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`math-answer:${userId}`, { limit: 120, windowMs: 60_000 });
  if (!limit.success) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { battleId } = await params;
  const { questionIndex, answer } = await req.json();

  await connectDB();
  const [battle, me] = await Promise.all([
    Battle.findById(battleId),
    User.findOne({ clerkId: userId }).select("_id"),
  ]);
  if (!battle || !me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = battle.participants.some((p) => String(p.user) === String(me._id));
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessionSnap = await adminDB.ref(realtimePaths.battleState(battleId)).get();
  const state = sessionSnap.val();
  if (!state || Date.now() >= state.endsAt) {
    return NextResponse.json({ error: "This duel has ended" }, { status: 409 });
  }

  // Regenerate the same deterministic question the client showed — never
  // trusts a client-provided "correct" flag.
  const question = getMathQuestion(battleId, questionIndex);
  const isCorrect = Number(answer) === question.answer;

  let attempt = await MathAttempt.findOne({ battle: battleId, user: me._id });
  if (!attempt) attempt = new MathAttempt({ battle: battleId, user: me._id, lastQuestionIndex: -1 });

  // A wrong answer no longer advances the question, so the client may
  // legitimately retry the same index many times — only a *correct*
  // answer past the highest index already solved counts.
  if (isCorrect && questionIndex > attempt.lastQuestionIndex) {
    attempt.correctCount += 1;
    attempt.totalAnswered += 1;
    attempt.lastQuestionIndex = questionIndex;
    await attempt.save();

    await adminDB.ref(realtimePaths.battleAnswer(battleId, userId)).set({
      correctCount: attempt.correctCount,
      totalAnswered: attempt.totalAnswered,
      updatedAt: Date.now(),
    });
  }

  return NextResponse.json({ isCorrect, correctCount: attempt.correctCount, totalAnswered: attempt.totalAnswered });
}