import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { Quiz } from "@/models/Quiz";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { computeLeaderboard } from "@/lib/quiz-service";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const sessionRef = adminDB.ref(realtimePaths.quizSession(roomId));

  // Whichever client's timer hits zero first wins this transaction — the
  // same race-safety pattern as the battle-settlement trigger.
  const result = await sessionRef.transaction((session) => {
    if (!session || session.status !== "question") return session;
    session.status = "revealing";
    return session;
  });

  if (!result.committed) {
    return NextResponse.json({ alreadyRevealed: true });
  }

  await connectDB();
  const room = await Room.findById(roomId);
  const quiz = await Quiz.findById(room.quiz).populate("questions");
  const question = quiz.questions[result.snapshot.val().currentQuestionIndex];
  const correctOptionIndex = question.options.findIndex((o) => o.isCorrect);

  const leaderboard = await computeLeaderboard(roomId);
  await sessionRef.update({ status: "reveal", correctOptionIndex, leaderboard });

  return NextResponse.json({ correctOptionIndex, leaderboard });
}