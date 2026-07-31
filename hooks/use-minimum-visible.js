"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a loading state visible for at least `minVisibleMs`, even if the
 * underlying condition resolves faster than that. Prevents loaders from
 * flashing on/off too quickly to actually register — especially common
 * in local dev where two browser tabs on the same machine connect to
 * Firebase almost instantly.
 */
export function useMinimumVisible(isActive, minVisibleMs = 1200) {
  const [visible, setVisible] = useState(isActive);
  const shownAt = useRef(isActive ? Date.now() : null);

  useEffect(() => {
    if (isActive) {
      shownAt.current = Date.now();
      setVisible(true);
      return;
    }

    if (!shownAt.current) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(0, minVisibleMs - elapsed);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [isActive, minVisibleMs]);

  return visible;
}

export default useMinimumVisible;