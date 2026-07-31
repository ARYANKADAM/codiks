import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getCsQuizDuelRoomData } from "@/lib/cs-quiz-duel-service";
import { CsQuizDuelClient } from "@/components/coding-quiz-duel/cs-quiz-duel-client";

export const metadata = { title: "CS Quiz Duel", robots: { index: false, follow: false } };

export default async function CsQuizDuelPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const data = await getCsQuizDuelRoomData(roomId, userId);
  if (!data) notFound();

  return (
    <CsQuizDuelClient
      roomId={data.roomId}
      battleId={data.battleId}
      currentUserId={userId}
      opponent={data.opponent}
      questions={data.questions}
    />
  );
}