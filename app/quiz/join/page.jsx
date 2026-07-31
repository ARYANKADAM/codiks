"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JoinQuizPage() {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  async function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/quiz-rooms/${code.trim().toUpperCase()}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/quiz/${data.roomId}`);
    } catch (err) {
      toast.error(err.message);
      setIsJoining(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join a quiz</CardTitle>
          <CardDescription>Enter the room code your host shared.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 7F3K2Q"
              maxLength={8}
              className="rounded-lg border border-input bg-background px-3 py-2 text-center font-mono text-lg uppercase tracking-widest outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" disabled={isJoining}>{isJoining ? "Joining…" : "Join Quiz"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}