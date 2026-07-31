import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getBattleRoomData } from "@/lib/battle-service";
import { BattleRoomClient } from "@/components/battle/battle-room-client";

export const metadata = { title: "Battle", robots: { index: false, follow: false } };

export default async function BattleRoomPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const data = await getBattleRoomData(roomId, userId);
  if (!data) notFound();

  return (
    <BattleRoomClient
      roomId={data.roomId}
      battleId={data.battleId}
      currentUserId={userId}
      opponent={data.opponent}
      question={data.question}
    />
  );
}