import "server-only";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";

export async function getMathDuelRoomData(roomId, clerkId) {
  await connectDB();

  const room = await Room.findById(roomId)
    .populate({ path: "players.user", select: "clerkId username avatarUrl mathRating" })
    .populate({ path: "battle", populate: { path: "participants.user", select: "clerkId username avatarUrl mathRating" } })
    .lean();

  if (!room || room.mode !== "math" || !room.battle) return null;

  const isParticipant = room.players.some((p) => p.user?.clerkId === clerkId);
  if (!isParticipant) return null;

  const opponentEntry = room.players.find((p) => p.user?.clerkId !== clerkId);

  return {
    roomId: String(room._id),
    battleId: String(room.battle._id),
    opponent: opponentEntry?.user
      ? {
          clerkId: opponentEntry.user.clerkId,
          username: opponentEntry.user.username,
          avatarUrl: opponentEntry.user.avatarUrl,
          rating: opponentEntry.user.mathRating,
        }
      : null,
  };
}

export default getMathDuelRoomData;