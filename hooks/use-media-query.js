"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Used to react to
 * viewport breakpoint changes (e.g. auto-closing the mobile sidebar when
 * the window is resized past the desktop breakpoint).
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default useMediaQuery;