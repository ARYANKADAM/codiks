import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getMathDuelRoomData } from "@/lib/math-duel-service";
import { MathDuelClient } from "@/components/math-duel/math-duel-client";

export const metadata = { title: "Math Duel", robots: { index: false, follow: false } };

export default async function MathDuelPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const data = await getMathDuelRoomData(roomId, userId);
  if (!data) notFound();

  return (
    <MathDuelClient
      roomId={data.roomId}
      battleId={data.battleId}
      currentUserId={userId}
      opponent={data.opponent}
    />
  );
}