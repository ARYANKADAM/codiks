"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionCountdownLoader } from "@/components/quiz/question-countdown-loader";
import { Avatar } from "@/components/shared/avatar";

export function QuizLeaderboardReveal({ leaderboard = [], isFinal, autoAdvanceMs }) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil((autoAdvanceMs ?? 0) / 1000));

  useEffect(() => {
    if (isFinal || !autoAdvanceMs) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinal, autoAdvanceMs]);

  // Between questions: loader only, no leaderboard, no text label.
  if (!isFinal) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <QuestionCountdownLoader secondsLeft={secondsLeft} showLabel={false} />
      </div>
    );
  }

  // Quiz finished: leaderboard only, no loader.
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Final Results 🏆</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((entry) => (
            <motion.div
              key={entry.clerkId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: entry.rank * 0.08 }}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <span className="w-6 text-center font-bold text-muted-foreground">
                {entry.rank === 1 ? <Crown className="mx-auto size-5 text-warning" /> : entry.rank}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
            <Avatar src={entry.avatarUrl} alt={entry.username} size="sm" />
              <span className="flex-1 truncate text-sm font-medium">{entry.username}</span>
              <span className="text-sm font-bold">{entry.totalScore} pts</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" onClick={() => router.push("/dashboard")}>
        Back to dashboard
      </Button>
    </div>
  );
}

export default QuizLeaderboardReveal;