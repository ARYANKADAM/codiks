"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRoomPresence } from "@/hooks/use-room-presence";
import { useOpponentAnswer } from "@/hooks/use-opponent-answer";
import { useServerTimeOffset } from "@/hooks/use-server-time";
import { useDuelTimer } from "@/hooks/use-duel-timer";
import { useMinimumVisible } from "@/hooks/use-minimum-visible";
import { WaitingForOpponentOverlay } from "@/components/battle/waiting-for-opponent-overlay";
import { LiveScorePanel } from "@/components/math-duel/live-score-panel";
import { MathQuestionCard } from "@/components/math-duel/math-question-card";
import { ResultsModal } from "@/components/battle/results-modal";
import { ForfeitButton } from "@/components/battle/forfeit-button";

export function MathDuelClient({ roomId, battleId, currentUserId, opponent }) {
  const players = useRoomPresence(roomId, currentUserId);
  const opponentPresence = opponent ? players[opponent.clerkId] : null;
  const bothConnected = Boolean(players[currentUserId]?.connected && opponentPresence?.connected);
  const showWaitingOverlay = useMinimumVisible(!bothConnected, 1500);

  const { state: battleState, isCompleted } = useDuelTimer(
    battleId,
    bothConnected,
    `/api/math-duels/${battleId}/start`
  );

  

  const offset = useServerTimeOffset();
  const [now, setNow] = useState(() => Date.now() + offset);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const hasTriedSettle = useRef(false);
  const liveOpponent = useOpponentAnswer(battleId, opponent?.clerkId);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() + offset), 200);
    return () => clearInterval(interval);
  }, [offset]);

  useEffect(() => {
    if (!battleState || isCompleted || hasTriedSettle.current) return;
    if (now >= battleState.endsAt) {
      hasTriedSettle.current = true;
      fetch(`/api/math-duels/${battleId}/settle`, { method: "POST" }).catch(() => {
        hasTriedSettle.current = false;
      });
    }
  }, [now, battleState, isCompleted, battleId]);

  // useEffect(() => {
  //   console.log("MATH DUEL DEBUG:", { opponent, bothConnected, players });
  // }, [opponent, bothConnected, players]);

  useEffect(() => {
    if (!isCompleted) return;
    fetch(`/api/battles/${battleId}/result`)
      .then((res) => res.json())
      .then(setFinalResult)
      .catch(() => {});
  }, [isCompleted, battleId]);

  async function handleAnswer(questionIndex, answerValue) {
    try {
      const res = await fetch(`/api/math-duels/${battleId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionIndex, answer: answerValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit answer");
        return false;
      }
      setMyScore(data.correctCount);
      if (data.isCorrect) {
        setCurrentIndex((i) => i + 1);
      }
      return data.isCorrect;
    } catch {
      toast.error("Could not submit answer");
      return false;
    }
  }

  const hasStarted = battleState && now >= battleState.startedAt;
  const secondsLeft = battleState ? Math.max(0, Math.ceil((battleState.endsAt - now) / 1000)) : 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center gap-6 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg uppercase">Math Sprint</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold tabular-nums">
            {hasStarted && !isCompleted ? `${secondsLeft}s` : "--"}
          </span>
          {battleState && !isCompleted && (
            <ForfeitButton battleId={battleId} forfeitEndpoint={`/api/math-duels/${battleId}/forfeit`} />
          )}
        </div>
      </div>

      <LiveScorePanel
        opponent={opponent}
        myScore={myScore}
        opponentScore={liveOpponent?.correctCount ?? 0}
        opponentConnected={Boolean(opponentPresence?.connected)}
      />

      {hasStarted && !isCompleted && (
        <MathQuestionCard battleId={battleId} questionIndex={currentIndex} onAnswer={handleAnswer} />
      )}

      {battleState && !hasStarted && !isCompleted && (
        <p className="text-center font-display text-2xl">
          Starting in {Math.ceil((battleState.startedAt - now) / 1000)}s…
        </p>
      )}

      <WaitingForOpponentOverlay isOpen={showWaitingOverlay && !isCompleted} />
      <ResultsModal result={finalResult} currentUserId={currentUserId} />
    </div>
  );
}

export default MathDuelClient;