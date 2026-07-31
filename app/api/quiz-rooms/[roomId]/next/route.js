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
  await connectDB();

  const room = await Room.findById(roomId).populate("players.user", "clerkId");
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = room.players.some((p) => p.user.clerkId === userId);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessionRef = adminDB.ref(realtimePaths.quizSession(roomId));

  // Every player's client races to call this once the reveal shows —
  // the transaction guarantees only the first request actually advances
  // the question; everyone else's call is a harmless no-op.
  const result = await sessionRef.transaction((session) => {
    if (!session || session.status !== "reveal") return session; // abort if already advanced
    session.status = "advancing";
    return session;
  });

  if (!result.committed) {
    return NextResponse.json({ alreadyAdvanced: true });
  }

  const session = result.snapshot.val();
  const nextIndex = session.currentQuestionIndex + 1;

  if (nextIndex >= session.totalQuestions) {
    const leaderboard = await computeLeaderboard(roomId);
    room.status = "completed";
    await room.save();
    await sessionRef.update({ status: "completed", leaderboard });
    return NextResponse.json({ status: "completed", leaderboard });
  }

  const quiz = await Quiz.findById(room.quiz);
  const startedAt = Date.now();
  await sessionRef.update({
    status: "question",
    currentQuestionIndex: nextIndex,
    questionStartedAt: startedAt,
    questionEndsAt: startedAt + quiz.timePerQuestionSec * 1000,
    correctOptionIndex: null,
  });

  return NextResponse.json({ currentQuestionIndex: nextIndex });
}