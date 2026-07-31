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
const STALE_ENTRY_MS = 60_000; // any entry older than this gets purged, regardless of status

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
      // Purge anything stuck (crashed before cleanup, or genuinely abandoned) —
      // this is what prevents corrupted entries from poisoning every future tick.
      for (const [uid, entry] of Object.entries(queue)) {
        if (!entry || now - entry.joinedAt > STALE_ENTRY_MS) {
          delete queue[uid];
        }
      }

      return runPairingPass(queue, matchedPairs);
    });
  } catch (err) {
    console.error("Matchmaking tick transaction failed:", err.message);
    return []; // fail soft — client will just retry on its next poll
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
      if (entryB.mode !== entryA.mode) continue; // only pair identical duel modes

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
  const mode = pair[0].mode === "math" ? "math" : "coding";
  const users = await User.find({ clerkId: { $in: pair.map((p) => p.uid) } });

  const room = await Room.create({
    roomCode: generateRoomCode(),
    host: users[0]._id,
    players: users.map((u) => ({ user: u._id, isReady: false })),
    mode: mode === "math" ? "math" : "1v1",
    status: "starting",
    maxPlayers: 2,
  });

  let questionIds = [];
  if (mode !== "math") {
    const question = await Question.aggregate([
      { $match: { type: "coding", isPublished: true } },
      { $sample: { size: 1 } },
    ]);
    questionIds = question.length ? [question[0]._id] : [];
  }

  const battle = await Battle.create({
    room: room._id,
    participants: users.map((u) => ({
      user: u._id,
      ratingBefore: mode === "math" ? u.mathRating : u.rating,
    })),
    mode: mode === "math" ? "math" : "ranked",
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