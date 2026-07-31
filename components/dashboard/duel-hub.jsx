"use client";

import { useState } from "react";
import { DuelModeTabs } from "@/components/dashboard/duel-mode-tabs";
import { QuickMatchCta } from "@/components/dashboard/quick-match-cta";

export function DuelHub({ csQuizRating, mathRating }) {
  const [mode, setMode] = useState("cs_quiz");

  return (
    <div className="space-y-4">
      <DuelModeTabs activeMode={mode} onSelect={setMode} csQuizRating={csQuizRating} mathRating={mathRating} />
      <QuickMatchCta mode={mode} />
    </div>
  );
}

export default DuelHub;