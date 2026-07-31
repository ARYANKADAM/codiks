import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { Quiz } from "@/models/Quiz";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

const START_BUFFER_MS = 4000;

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await params;
  await connectDB();

  const room = await Room.findById(roomId).populate("host", "clerkId");
  if (!room || room.mode !== "quiz") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (room.host.clerkId !== userId) {
    return NextResponse.json({ error: "Only the host can start the quiz" }, { status: 403 });
  }
  if (room.status !== "waiting") {
    return NextResponse.json({ error: "Quiz already started" }, { status: 409 });
  }

  const quiz = await Quiz.findById(room.quiz);
  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) {
    return NextResponse.json({ error: "This quiz has no questions" }, { status: 400 });
  }

  room.status = "in_progress";
  await room.save();

  const startedAt = Date.now() + START_BUFFER_MS;
  const session = {
    status: "question",
    currentQuestionIndex: 0,
    totalQuestions,
    questionStartedAt: startedAt,
    questionEndsAt: startedAt + quiz.timePerQuestionSec * 1000,
  };

  await adminDB.ref(realtimePaths.quizSession(roomId)).set(session);
  return NextResponse.json({ session });
}