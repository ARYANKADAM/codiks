"use client";

import { useState } from "react";
import { DuelModeTabs } from "@/components/dashboard/duel-mode-tabs";
import { QuickMatchCta } from "@/components/dashboard/quick-match-cta";

export function DuelHub({ rating, mathRating }) {
  const [mode, setMode] = useState("coding");

  return (
    <div className="space-y-4">
      <DuelModeTabs activeMode={mode} onSelect={setMode} rating={rating} mathRating={mathRating} />
      <QuickMatchCta mode={mode} />
    </div>
  );
}

export default DuelHub;