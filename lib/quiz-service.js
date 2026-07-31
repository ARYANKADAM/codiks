import "server-only";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt } from "@/models/QuizAttempt";

// Strips isCorrect from every option — this is the only question payload
// that ever reaches the browser before a question is revealed.
export function serializeQuestionForClient(question) {
  return {
    id: String(question._id),
    title: question.title,
    prompt: question.prompt,
    points: question.points,
    options: question.options.map((o) => ({ text: o.text })),
  };
}

export async function getQuizRoomData(roomId, clerkId) {
  await connectDB();

  const room = await Room.findById(roomId)
    .populate({ path: "players.user", select: "clerkId username avatarUrl" })
    .populate({ path: "host", select: "clerkId username" })
    .lean();

  if (!room || room.mode !== "quiz") return null;

  const isParticipant = room.players.some((p) => p.user?.clerkId === clerkId);
  if (!isParticipant) return null;

  const quiz = await Quiz.findById(room.quiz).populate({
    path: "questions",
    select: "title prompt points options",
  }).lean();

  return {
    roomId: String(room._id),
    roomCode: room.roomCode,
    hostClerkId: room.host.clerkId,
    status: room.status,
    quizTitle: quiz.title,
    timePerQuestionSec: quiz.timePerQuestionSec,
    questions: quiz.questions.map(serializeQuestionForClient),
    players: room.players.map((p) => ({
      clerkId: p.user.clerkId,
      username: p.user.username,
      avatarUrl: p.user.avatarUrl,
    })),
  };
}

export async function computeLeaderboard(roomId) {
  await connectDB();
  const attempts = await QuizAttempt.find({ room: roomId }).populate("user", "clerkId username avatarUrl");

  return attempts
    .map((a) => ({
      clerkId: a.user.clerkId,
      username: a.user.username,
      avatarUrl: a.user.avatarUrl,
      totalScore: a.totalScore,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export default getQuizRoomData;