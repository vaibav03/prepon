"use client";

import { useEffect, useState } from "react";

/**
 * A media query as a boolean.
 *
 * It answers `fallback` on the server and for the first client frame, then
 * corrects itself after mount. Callers must therefore use it only for
 * behaviour, never for markup that differs between the two — layout that
 * changes at a breakpoint belongs in CSS, where it is right on the first
 * paint and cannot disagree with the server.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

export default useMediaQuery;
