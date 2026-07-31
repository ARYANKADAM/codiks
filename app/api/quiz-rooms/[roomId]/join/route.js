import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Room } from "@/models/Room";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId: roomCode } = await params; // param folder is [roomId], but this route treats its value as the room's short code
  await connectDB();

  const [me, room] = await Promise.all([
    User.findOne({ clerkId: userId }),
    Room.findOne({ roomCode: roomCode.toUpperCase(), mode: "quiz" }),
  ]);

  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.status !== "waiting") {
    return NextResponse.json({ error: "This quiz has already started" }, { status: 409 });
  }

  const alreadyIn = room.players.some((p) => String(p.user) === String(me._id));
  if (!alreadyIn) {
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 409 });
    }
    room.players.push({ user: me._id, isReady: true });
    await room.save();
  }

  return NextResponse.json({ roomId: String(room._id) });
}