"use client";

import { useEffect, useState } from "react";

export function useCountdown(initialMs) {
  const [remaining, setRemaining] = useState(initialMs);

  useEffect(() => {
    setRemaining(initialMs);
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(interval);
  }, [initialMs]);

  const totalSec = Math.floor(remaining / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default useCountdown;