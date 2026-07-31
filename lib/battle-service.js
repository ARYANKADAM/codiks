import "server-only";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";

function serializeQuestion(question) {
  if (!question) return null;
  return {
    id: String(question._id),
    title: question.title,
    prompt: question.prompt,
    difficulty: question.difficulty,
    constraints: question.constraints ?? null,
    testCases: (question.testCases ?? []).map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
    })),
    starterCode: question.starterCode
      ? Object.fromEntries(
          question.starterCode instanceof Map ? question.starterCode : Object.entries(question.starterCode)
        )
      : {},
  };
}

/**
 * Loads everything a battle room needs to render, and enforces that only
 * the two matched participants can view it. Anyone else — including a
 * guessed roomId — gets null, and the page 404s.
 */
export async function getBattleRoomData(roomId, clerkId) {
  await connectDB();

  const room = await Room.findById(roomId)
    .populate({ path: "players.user", select: "clerkId username avatarUrl rating" })
    .populate({
      path: "battle",
      populate: [
        { path: "questions", select: "title prompt difficulty constraints testCases starterCode" },
        { path: "participants.user", select: "clerkId username avatarUrl rating" },
      ],
    })
    .lean();

  if (!room || !room.battle) return null;

  const isParticipant = room.players.some((p) => p.user?.clerkId === clerkId);
  if (!isParticipant) return null;

  const opponentEntry = room.players.find((p) => p.user?.clerkId !== clerkId);

  return {
    roomId: String(room._id),
    battleId: String(room.battle._id),
    question: serializeQuestion(room.battle.questions?.[0]),
    opponent: opponentEntry?.user
      ? {
          clerkId: opponentEntry.user.clerkId,
          username: opponentEntry.user.username,
          avatarUrl: opponentEntry.user.avatarUrl,
          rating: opponentEntry.user.rating,
        }
      : null,
  };
}

export default getBattleRoomData;