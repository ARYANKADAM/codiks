"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerTimeOffset } from "@/hooks/use-server-time";
import { useQuizAnswerCount } from "@/hooks/use-quiz-answer-count";

const OPTION_COLORS = [
  "bg-destructive/15 border-destructive/40",
  "bg-primary/15 border-primary/40",
  "bg-success/15 border-success/40",
  "bg-warning/15 border-warning/40",
];

export function QuizQuestionView({ roomId, question, questionIndex, totalQuestions, session, totalPlayers }) {
  const offset = useServerTimeOffset();
  const [now, setNow] = useState(() => Date.now() + offset);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const hasTriedReveal = useRef(false);
  const answeredCount = useQuizAnswerCount(roomId, questionIndex);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() + offset), 200);
    return () => clearInterval(interval);
  }, [offset]);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    hasTriedReveal.current = false;
  }, [questionIndex]);

  useEffect(() => {
    if (!session || hasTriedReveal.current) return;
    if (now >= session.questionEndsAt) {
      hasTriedReveal.current = true;
      fetch(`/api/quiz-rooms/${roomId}/reveal`, { method: "POST" }).catch(() => {
        hasTriedReveal.current = false;
      });
    }
  }, [now, session, roomId]);

  async function handleSelect(index) {
    if (selected != null) return;
    setSelected(index);
    try {
      const res = await fetch(`/api/quiz-rooms/${roomId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionIndex, selectedOptionIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback(data);
    } catch (err) {
      toast.error(err.message);
      setSelected(null);
    }
  }

  const remaining = session ? Math.max(0, session.questionEndsAt - now) : 0;
  const total = session ? session.questionEndsAt - session.questionStartedAt : 1;
  const progressPercent = Math.max(0, Math.min(100, (remaining / total) * 100));

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {questionIndex + 1} / {totalQuestions}</span>
        <span className="flex items-center gap-1">
          <Users className="size-4" /> {answeredCount}/{totalPlayers} answered
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div className="h-full bg-gradient-brand" animate={{ width: `${progressPercent}%` }} transition={{ ease: "linear", duration: 0.2 }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.title}</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{question.prompt}</CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              disabled={selected != null}
              onClick={() => handleSelect(i)}
              className={`flex items-center justify-between rounded-xl border-2 p-4 text-left text-sm font-medium transition-all disabled:cursor-not-allowed ${OPTION_COLORS[i % OPTION_COLORS.length]} ${isSelected ? "ring-2 ring-ring" : "opacity-90 hover:opacity-100"}`}
            >
              {option.text}
              {isSelected && feedback && (feedback.isCorrect ? <CheckCircle2 className="size-5 text-success" /> : <XCircle className="size-5 text-destructive" />)}
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <p className="text-center text-sm font-medium">
          {feedback.isCorrect ? `+${feedback.pointsEarned} points!` : "Not quite — see you next round."}
        </p>
      )}
    </div>
  );
}

export default QuizQuestionView;