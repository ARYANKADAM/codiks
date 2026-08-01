"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { setPresenceMode } from "@/lib/presence-client";
import { DuelModeTabs } from "@/components/dashboard/duel-mode-tabs";
import { QuickMatchCta } from "@/components/dashboard/quick-match-cta";
import { DiscoverRow } from "@/components/friends/discover-row";

export function DuelHub({ csQuizRating, mathRating }) {
  const { user } = useUser();
  const [mode, setMode] = useState("cs_quiz");

  useEffect(() => {
    setPresenceMode(user?.id, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function handleSelect(nextMode) {
    setMode(nextMode);
    setPresenceMode(user?.id, nextMode);
  }

  return (
    <div id="duel-hub" className="space-y-4">
      {/* <DiscoverRow /> */}
      <DuelModeTabs activeMode={mode} onSelect={handleSelect} csQuizRating={csQuizRating} mathRating={mathRating} />
      <QuickMatchCta mode={mode} />
    </div>
  );
}

export default DuelHub;