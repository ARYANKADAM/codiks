"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Users2, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export function QuizBrowseClient({ quizzes }) {
  const router = useRouter();
  const [hostingId, setHostingId] = useState(null);

  async function handleHost(quizId) {
    setHostingId(quizId);
    try {
      const res = await fetch("/api/quiz-rooms/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/quiz/${data.roomId}`);
    } catch (err) {
      toast.error(err.message);
      setHostingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" asChild>
        <Link href="/quiz/join"><KeyRound /> Join with a code</Link>
      </Button>

      {quizzes.length === 0 ? (
        <EmptyState icon={Users2} title="No quizzes yet" description="Check back soon." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{quiz.title}</CardTitle>
                  <Badge variant="secondary">{quiz.difficulty}</Badge>
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{quiz.questionCount} questions</span>
                <Button size="sm" onClick={() => handleHost(quiz.id)} disabled={hostingId === quiz.id}>
                  {hostingId === quiz.id ? "Creating…" : "Host"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizBrowseClient;