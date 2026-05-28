"use client";

import { useCallback, useEffect, useState } from "react";

export function usePersistedState<T>(key: string, seed: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore corrupt JSON — fall back to seed
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(resolved));
          } catch {
            // storage full or blocked — silent
          }
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated];
}

export function clearPersistedKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
