"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Play, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoomPresence } from "@/hooks/use-room-presence";
import { ConnectingLoader } from "@/components/shared/connecting-loader";
import { useMinimumVisible } from "@/hooks/use-minimum-visible";

export function QuizLobby({ roomId, roomCode, quizTitle, isHost, currentUserId, players }) {
  const presence = useRoomPresence(roomId, currentUserId);
  const [isStarting, setIsStarting] = useState(false);
  const connectedPlayers = players.filter((p) => presence[p.clerkId]?.connected);
  const isConnecting = connectedPlayers.length < players.length;
  const showConnectingLoader = useMinimumVisible(isConnecting, 1500);

  async function handleStart() {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/quiz-rooms/${roomId}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      toast.error(err.message);
      setIsStarting(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{quizTitle}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            Share this code:
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-sm font-bold text-foreground"
            >
              {roomCode} <Copy className="size-3" />
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        {showConnectingLoader && (
            <ConnectingLoader label={`Waiting for ${players.length - connectedPlayers.length} more to connect…`} size={10} />
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            {connectedPlayers.length} player{connectedPlayers.length !== 1 ? "s" : ""} connected
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <div key={p.clerkId} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
                <span className={`size-2 rounded-full ${presence[p.clerkId]?.connected ? "bg-success" : "bg-muted-foreground"}`} />
                {p.username}
              </div>
            ))}
          </div>
          {isHost ? (
            <Button className="w-full" size="lg" onClick={handleStart} disabled={isStarting}>
              <Play />
              {isStarting ? "Starting…" : "Start Quiz"}
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Waiting for the host to start…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuizLobby;