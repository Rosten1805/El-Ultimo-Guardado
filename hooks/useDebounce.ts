"use client";
import { useState, useRef, useCallback } from "react";

export function useDebounce(delay = 300) {
  const [debounced, setDebounced] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((v: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(v), delay);
  }, [delay]);

  return [debounced, update] as const;
}
