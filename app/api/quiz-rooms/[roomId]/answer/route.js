import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt } from "@/models/QuizAttempt";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`quiz-answer:${userId}`, { limit: 30, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { roomId } = await params;
  const { questionIndex, selectedOptionIndex } = await req.json();
  await connectDB();

  const [me, room] = await Promise.all([User.findOne({ clerkId: userId }), Room.findById(roomId)]);
  if (!me || !room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = room.players.some((p) => String(p.user) === String(me._id));
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const quiz = await Quiz.findById(room.quiz).populate("questions");
  const question = quiz.questions[questionIndex];
  if (!question) return NextResponse.json({ error: "Invalid question index" }, { status: 400 });

  // Authoritative timing lives in Firebase — never trust a client-sent timestamp.
  const sessionSnap = await adminDB.ref(realtimePaths.quizSession(roomId)).get();
  const session = sessionSnap.val();
  if (!session || session.currentQuestionIndex !== questionIndex || session.status !== "question") {
    return NextResponse.json({ error: "This question is no longer accepting answers" }, { status: 409 });
  }

  const now = Date.now();
  const isCorrect = question.options[selectedOptionIndex]?.isCorrect === true;
  const remainingFraction = Math.max(
    0,
    Math.min(1, (session.questionEndsAt - now) / (session.questionEndsAt - session.questionStartedAt))
  );
  const pointsEarned = isCorrect ? Math.round(question.points * (0.5 + 0.5 * remainingFraction)) : 0;

  let attempt = await QuizAttempt.findOne({ room: roomId, user: me._id });
  if (!attempt) {
    attempt = new QuizAttempt({ room: roomId, quiz: quiz._id, user: me._id, answers: [], totalScore: 0 });
  }

  const alreadyAnswered = attempt.answers.some((a) => String(a.question) === String(question._id));
  if (alreadyAnswered) {
    return NextResponse.json({ error: "You already answered this question" }, { status: 409 });
  }

  attempt.answers.push({
    question: question._id,
    selectedOptionIndex,
    isCorrect,
    pointsEarned,
    answeredAt: new Date(now),
  });
  attempt.totalScore += pointsEarned;
  await attempt.save();

  // Room-visible marker only — correctness is never broadcast to opponents.
  await adminDB.ref(realtimePaths.quizPlayerAnswer(roomId, questionIndex, userId)).set({ answeredAt: now });

  return NextResponse.json({ isCorrect, pointsEarned, totalScore: attempt.totalScore });
}