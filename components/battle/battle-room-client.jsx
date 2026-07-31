"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoomPresence } from "@/hooks/use-room-presence";
import { useBattleState } from "@/hooks/use-battle-state";
import { useOpponentAnswer } from "@/hooks/use-opponent-answer";
import { ProblemPanel } from "@/components/battle/problem-panel";
import { CodeEditor } from "@/components/battle/code-editor";
import { OpponentPanel } from "@/components/battle/opponent-panel";
import { BattleTimer } from "@/components/battle/battle-timer";
import { SubmissionResult } from "@/components/battle/submission-result";
import { ResultsModal } from "@/components/battle/results-modal";
import { WaitingForOpponentOverlay } from "@/components/battle/waiting-for-opponent-overlay";
import { useMinimumVisible } from "@/hooks/use-minimum-visible";
import { ForfeitButton } from "@/components/battle/forfeit-button";

export function BattleRoomClient({ roomId, battleId, currentUserId, opponent, question }) {
  const players = useRoomPresence(roomId, currentUserId);
  const opponentPresence = opponent ? players[opponent.clerkId] : null;
  const bothConnected = Boolean(players[currentUserId]?.connected && opponentPresence?.connected);
  const showWaitingOverlay = useMinimumVisible(!bothConnected, 1500);

  const { state: battleState, isCompleted } = useBattleState(battleId, bothConnected);
  const liveOpponentAnswer = useOpponentAnswer(battleId, opponent?.clerkId);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  async function callJudge({ language, code, isRun }) {
    const res = await fetch(`/api/battles/${battleId}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language, code, isRun }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Judging failed");
    return data;
  }

  async function handleRun({ language, code }) {
    setIsRunning(true);
    try {
      setOutcome(await callJudge({ language, code, isRun: true }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit({ language, code }) {
    setIsSubmitting(true);
    try {
      const result = await callJudge({ language, code, isRun: false });
      setOutcome(result);
      if (result.verdict === "accepted") {
        toast.success("All test cases passed! 🎉");
      } else {
        toast.error(`Submission result: ${result.verdict.replace(/_/g, " ")}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!isCompleted) return;
    fetch(`/api/battles/${battleId}/result`)
      .then((res) => res.json())
      .then(setFinalResult)
      .catch(() => {});
  }, [isCompleted, battleId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <OpponentPanel
          opponent={opponent}
          isConnected={Boolean(opponentPresence?.connected)}
          liveAnswer={liveOpponentAnswer}
        />
        <div className="flex items-center gap-3">
          <BattleTimer battleId={battleId} battleState={battleState} isCompleted={isCompleted} />
          {battleState && !isCompleted && <ForfeitButton battleId={battleId} />}
        </div>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <ProblemPanel question={question} />
        <div className="flex flex-col gap-4">
          <div className="min-h-[320px] flex-1">
            <CodeEditor
              starterCode={question?.starterCode ?? {}}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>
          <SubmissionResult outcome={outcome} />
        </div>
      </div>

      <ResultsModal result={finalResult} currentUserId={currentUserId} />
     <WaitingForOpponentOverlay isOpen={showWaitingOverlay && !isCompleted} />
    </div>
  );
}

export default BattleRoomClient;