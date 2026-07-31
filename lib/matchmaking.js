import "server-only";
import { adminDB } from "@/lib/firebase-admin";
import { realtimePaths } from "@/lib/realtime-paths";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { Battle } from "@/models/Battle";
import { Question } from "@/models/Question";
import { generateRoomCode } from "@/lib/room-code";

const BASE_RATING_WINDOW = 100;
const WINDOW_GROWTH_PER_SEC = 10;
const MAX_RATING_WINDOW = 600;
const STALE_ENTRY_MS = 60_000;
const CS_QUIZ_QUESTION_COUNT = 20;

function ratingWindowFor(waitedMs) {
  const waitedSec = waitedMs / 1000;
  return Math.min(MAX_RATING_WINDOW, BASE_RATING_WINDOW + waitedSec * WINDOW_GROWTH_PER_SEC);
}

export async function runMatchmakingTick() {
  const queueRef = adminDB.ref(realtimePaths.matchmakingQueue());
  const matchedPairs = [];

  try {
    await queueRef.transaction((queue) => {
      if (!queue) return queue;

      const now = Date.now();
      for (const [uid, entry] of Object.entries(queue)) {
        if (!entry || now - entry.joinedAt > STALE_ENTRY_MS) {
          delete queue[uid];
        }
      }

      return runPairingPass(queue, matchedPairs);
    });
  } catch (err) {
    console.error("Matchmaking tick transaction failed:", err.message);
    return [];
  }

  const createdRooms = [];
  for (const pair of matchedPairs) {
    const room = await createMatchedRoom(pair);
    createdRooms.push(room);
    await Promise.all(pair.map(({ uid }) => queueRef.child(uid).remove()));
  }

  return createdRooms;
}

function runPairingPass(queue, matchedPairs) {
  if (!queue) return queue;

  const entries = Object.entries(queue)
    .filter(([, entry]) => entry && entry.status === "waiting")
    .sort((a, b) => a[1].joinedAt - b[1].joinedAt);

  const claimed = new Set();
  const now = Date.now();

  for (let i = 0; i < entries.length; i++) {
    const [uidA, entryA] = entries[i];
    if (claimed.has(uidA)) continue;

    const windowA = ratingWindowFor(now - entryA.joinedAt);

    for (let j = i + 1; j < entries.length; j++) {
      const [uidB, entryB] = entries[j];
      if (claimed.has(uidB)) continue;
      if (entryB.mode !== entryA.mode) continue;

      const windowB = ratingWindowFor(now - entryB.joinedAt);
      const ratingGap = Math.abs(entryA.rating - entryB.rating);
      const tolerance = Math.max(windowA, windowB);

      if (ratingGap <= tolerance) {
        claimed.add(uidA);
        claimed.add(uidB);
        matchedPairs.push([
          { uid: uidA, rating: entryA.rating, mode: entryA.mode },
          { uid: uidB, rating: entryB.rating, mode: entryB.mode },
        ]);
        queue[uidA].status = "matched";
        queue[uidB].status = "matched";
        break;
      }
    }
  }

  return queue;
}

async function createMatchedRoom(pair) {
  await connectDB();
  const mode = pair[0].mode === "math" ? "math" : "cs_quiz";
  const users = await User.find({ clerkId: { $in: pair.map((p) => p.uid) } });

  const room = await Room.create({
    roomCode: generateRoomCode(),
    host: users[0]._id,
    players: users.map((u) => ({ user: u._id, isReady: false })),
    mode,
    status: "starting",
    maxPlayers: 2,
  });

  let questionIds = [];
  if (mode === "cs_quiz") {
    const sampled = await Question.aggregate([
      { $match: { type: "mcq", isPublished: true, tags: "cs-fundamentals" } },
      { $sample: { size: CS_QUIZ_QUESTION_COUNT } },
    ]);
    // Fall back to any published MCQ if the cs-fundamentals pool is too small.
    questionIds = sampled.length
      ? sampled.map((q) => q._id)
      : (
          await Question.aggregate([
            { $match: { type: "mcq", isPublished: true } },
            { $sample: { size: CS_QUIZ_QUESTION_COUNT } },
          ])
        ).map((q) => q._id);
  }

  const battle = await Battle.create({
    room: room._id,
    participants: users.map((u) => ({
      user: u._id,
      ratingBefore: mode === "math" ? u.mathRating : u.csQuizRating,
    })),
    mode,
    questions: questionIds,
    status: "pending",
  });

  room.battle = battle._id;
  await room.save();

  await Promise.all(
    pair.map(({ uid }) =>
      adminDB.ref(realtimePaths.matchmakingAssignment(uid)).set({
        roomId: String(room._id),
        battleId: String(battle._id),
        mode,
        assignedAt: Date.now(),
      })
    )
  );

  return { roomId: String(room._id), battleId: String(battle._id), mode };
}

export default runMatchmakingTick;