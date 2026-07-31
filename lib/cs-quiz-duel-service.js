import "server-only";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { serializeQuestionForClient } from "@/lib/quiz-service";

export async function getCsQuizDuelRoomData(roomId, clerkId) {
  await connectDB();

  const room = await Room.findById(roomId)
    .populate({ path: "players.user", select: "clerkId username avatarUrl csQuizRating" })
    .populate({
      path: "battle",
      populate: [
        { path: "questions", select: "title prompt points options" },
        { path: "participants.user", select: "clerkId username avatarUrl csQuizRating" },
      ],
    })
    .lean();

  if (!room || room.mode !== "cs_quiz" || !room.battle) return null;

  const isParticipant = room.players.some((p) => p.user?.clerkId === clerkId);
  if (!isParticipant) return null;

  const opponentEntry = room.players.find((p) => p.user?.clerkId !== clerkId);

  return {
    roomId: String(room._id),
    battleId: String(room.battle._id),
    questions: room.battle.questions.map(serializeQuestionForClient),
    opponent: opponentEntry?.user
      ? {
          clerkId: opponentEntry.user.clerkId,
          username: opponentEntry.user.username,
          avatarUrl: opponentEntry.user.avatarUrl,
          rating: opponentEntry.user.csQuizRating,
        }
      : null,
  };
}

export default getCsQuizDuelRoomData;