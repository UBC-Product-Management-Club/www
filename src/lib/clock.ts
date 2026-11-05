"use client";

import { useSyncExternalStore } from "react";

export type Now = number | null;

/** A once-a-second clock shared by every countdown; null on the server, so they never mismatch during hydration. */
const clock = {
  subscribe(cb: () => void) {
    const t = window.setInterval(cb, 1000);
    return () => window.clearInterval(t);
  },
  now: () => Math.floor(Date.now() / 1000) * 1000,
  server: () => null,
};

export const useNow = (): Now => useSyncExternalStore(clock.subscribe, clock.now, clock.server);
