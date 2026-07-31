"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForfeitButton({ battleId, forfeitEndpoint }) {
  const [confirming, setConfirming] = useState(false);
  const [isForfeiting, setIsForfeiting] = useState(false);
  const resetTimer = useRef(null);
  const router = useRouter();
  

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      resetTimer.current = setTimeout(() => setConfirming(false), 4000);
      return;
    }
    clearTimeout(resetTimer.current);
    forfeit();
  }

  async function forfeit() {
    setIsForfeiting(true);
    try {
      const res = await fetch(forfeitEndpoint ?? `/api/battles/${battleId}/forfeit`, { method: "POST" });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not forfeit");
      toast.info("You forfeited the match.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
      setIsForfeiting(false);
      setConfirming(false);
    }
  }

  return (
    <Button variant={confirming ? "destructive" : "outline"} size="sm" onClick={handleClick} disabled={isForfeiting}>
      <Flag className="size-4" />
      {isForfeiting ? "Forfeiting…" : confirming ? "Click again to confirm" : "Forfeit"}
    </Button>
  );
}

export default ForfeitButton;