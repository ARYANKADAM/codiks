"use client";
import { useCallback, useEffect, useRef } from "react";
import { useQuizSession } from "@/hooks/use-quiz-session";
import { QuizLobby } from "@/components/quiz/quiz-lobby";
import { QuizQuestionView } from "@/components/quiz/quiz-question-view";
import { QuizLeaderboardReveal } from "@/components/quiz/quiz-leaderboard-reveal";

const AUTO_ADVANCE_MS = 3500;

export function QuizRoomClient({ roomId, roomCode, quizTitle, hostClerkId, currentUserId, questions, players }) {
  const session = useQuizSession(roomId);
  const isHost = currentUserId === hostClerkId;
  const hasScheduledAdvance = useRef(null); // holds the questionIndex we've already scheduled for

  const handleNext = useCallback(async () => {
    fetch(`/api/quiz-rooms/${roomId}/next`, { method: "POST" }).catch(() => {});
  }, [roomId]);

  useEffect(() => {
    if (session?.status !== "reveal") return;
    if (hasScheduledAdvance.current === session.currentQuestionIndex) return;

    hasScheduledAdvance.current = session.currentQuestionIndex;
    const timer = setTimeout(handleNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [session?.status, session?.currentQuestionIndex, handleNext]);

  if (!session || session.status === "waiting") {
    return (
      <QuizLobby
        roomId={roomId}
        roomCode={roomCode}
        quizTitle={quizTitle}
        isHost={isHost}
        currentUserId={currentUserId}
        players={players}
      />
    );
  }

  if (session.status === "question" || session.status === "revealing") {
    const question = questions[session.currentQuestionIndex];
    return (
      <QuizQuestionView
        roomId={roomId}
        question={question}
        questionIndex={session.currentQuestionIndex}
        totalQuestions={session.totalQuestions}
        session={session}
        totalPlayers={players.length}
      />
    );
  }

  if (session.status === "reveal") {
    return <QuizLeaderboardReveal leaderboard={session.leaderboard ?? []} autoAdvanceMs={AUTO_ADVANCE_MS} />;
  }

  if (session.status === "completed") {
    return <QuizLeaderboardReveal leaderboard={session.leaderboard ?? []} isFinal />;
  }

  return null;
}

export default QuizRoomClient;