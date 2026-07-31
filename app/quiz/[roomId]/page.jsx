import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getQuizRoomData } from "@/lib/quiz-service";
import { QuizRoomClient } from "@/components/quiz/quiz-room-client";

export const metadata = { title: "Battle", robots: { index: false, follow: false } };

export default async function QuizRoomPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const data = await getQuizRoomData(roomId, userId);
  if (!data) notFound();

  return (
    <QuizRoomClient
      roomId={data.roomId}
      roomCode={data.roomCode}
      quizTitle={data.quizTitle}
      hostClerkId={data.hostClerkId}
      currentUserId={userId}
      questions={data.questions}
      players={data.players}
    />
  );
}