import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { Battle } from "@/models/Battle";
import { Question } from "@/models/Question";
import { generateRoomCode } from "@/lib/room-code";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";

const CS_QUIZ_QUESTION_COUNT = 20;

/**
 * Creates a room/battle for two specific players who agreed to duel via a
 * direct challenge — bypasses matchmaking's rating-based pairing entirely,
 * but reuses the same matchmaking-assignment mechanism to route both
 * players into the room automatically.
 */
export async function createChallengeRoom(fromClerkId, toClerkId, mode) {
  await connectDB();
  const users = await User.find({ clerkId: { $in: [fromClerkId, toClerkId] } });
  if (users.length !== 2) throw new Error("Could not find both players");

  const normalizedMode = mode === "math" ? "math" : "cs_quiz";

  const room = await Room.create({
    roomCode: generateRoomCode(),
    host: users[0]._id,
    players: users.map((u) => ({ user: u._id, isReady: false })),
    mode: normalizedMode,
    status: "starting",
    maxPlayers: 2,
  });

  let questionIds = [];
  if (normalizedMode === "cs_quiz") {
    const sampled = await Question.aggregate([
      { $match: { type: "mcq", isPublished: true, tags: "cs-fundamentals" } },
      { $sample: { size: CS_QUIZ_QUESTION_COUNT } },
    ]);
    questionIds = sampled.map((q) => q._id);
  }

  const battle = await Battle.create({
    room: room._id,
    participants: users.map((u) => ({
      user: u._id,
      ratingBefore: normalizedMode === "math" ? u.mathRating : u.csQuizRating,
    })),
    mode: normalizedMode,
    questions: questionIds,
    status: "pending",
  });

  room.battle = battle._id;
  await room.save();

  await Promise.all(
    users.map((u) =>
      adminDB.ref(realtimePaths.matchmakingAssignment(u.clerkId)).set({
        roomId: String(room._id),
        battleId: String(battle._id),
        mode: normalizedMode,
        assignedAt: Date.now(),
      })
    )
  );

  return { roomId: String(room._id), battleId: String(battle._id), mode: normalizedMode };
}

export default createChallengeRoom;