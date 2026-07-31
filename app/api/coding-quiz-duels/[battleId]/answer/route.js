import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Battle } from "@/models/Battle";
import { User } from "@/models/User";
import { CsQuizAttempt } from "@/models/CsQuizAttempt";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`cs-quiz-answer:${userId}`, { limit: 60, windowMs: 60_000 });
  if (!limit.success) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { battleId } = await params;
  const { questionIndex, selectedOptionIndex } = await req.json();

  await connectDB();
  const [battle, me] = await Promise.all([
    Battle.findById(battleId).populate("questions", "options"),
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

  // Wrap around if a player somehow burns through the whole sampled set —
  // duels are 60s so this is a defensive fallback, not the common case.
  const question = battle.questions[questionIndex % battle.questions.length];
  if (!question) return NextResponse.json({ error: "Invalid question index" }, { status: 400 });

  const isCorrect = question.options[selectedOptionIndex]?.isCorrect === true;

  let attempt = await CsQuizAttempt.findOne({ battle: battleId, user: me._id });
  if (!attempt) attempt = new CsQuizAttempt({ battle: battleId, user: me._id });

  // Guard against a duplicate/retried request re-counting the same question.
  if (questionIndex > attempt.lastQuestionIndex) {
    attempt.totalAnswered += 1;
    if (isCorrect) attempt.correctCount += 1;
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