import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Quiz } from "@/models/Quiz";
import { Room } from "@/models/Room";
import { generateRoomCode } from "@/lib/room-code";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId } = await req.json();
  await connectDB();

  const [me, quiz] = await Promise.all([User.findOne({ clerkId: userId }), Quiz.findById(quizId)]);
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (!quiz || !quiz.isPublished) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const room = await Room.create({
    roomCode: generateRoomCode(),
    host: me._id,
    players: [{ user: me._id, isReady: true }],
    mode: "quiz",
    quiz: quiz._id,
    status: "waiting",
    maxPlayers: 20,
  });

  return NextResponse.json({ roomId: String(room._id), roomCode: room.roomCode });
}