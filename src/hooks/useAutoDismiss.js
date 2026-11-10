import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'jarvis_subtitle_autodismiss_sec';
export const AUTO_DISMISS_OPTIONS = [0, 8, 12, 20, 30]; // 0 = off

function readSeconds() {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY) || '12', 10);
    return AUTO_DISMISS_OPTIONS.includes(v) ? v : 12;
  } catch {
    return 12;
  }
}

/**
 * Countdown that dismisses the response banner after J.A.R.V.I.S. finishes speaking.
 * - Starts only when `armed` is true (reply visible, not speaking, not processing)
 * - Pauses while `paused` (mouse hover / keyboard focus)
 * - Restarts whenever `resetKey` changes (new reply)
 */
export function useAutoDismiss({ armed, paused, resetKey, onDismiss }) {
  const [seconds, setSecondsState] = useState(readSeconds);
  const [remainingMs, setRemainingMs] = useState(seconds * 1000);
  const onDismissRef = useRef(onDismiss);
  const remainingRef = useRef(seconds * 1000);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Reset countdown on new reply or when duration changes
  useEffect(() => {
    remainingRef.current = seconds * 1000;
    setRemainingMs(seconds * 1000);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!armed || paused || seconds === 0) return undefined;
    const startedAt = Date.now();
    const startRemaining = remainingRef.current;
    const id = setInterval(() => {
      const next = Math.max(0, startRemaining - (Date.now() - startedAt));
      remainingRef.current = next;
      setRemainingMs(next);
      if (next === 0) {
        clearInterval(id);
        onDismissRef.current?.();
      }
    }, 200);
    return () => clearInterval(id);
  }, [armed, paused, seconds, resetKey]);

  const cycleSeconds = useCallback(() => {
    setSecondsState((cur) => {
      const idx = AUTO_DISMISS_OPTIONS.indexOf(cur);
      const next = AUTO_DISMISS_OPTIONS[(idx + 1) % AUTO_DISMISS_OPTIONS.length];
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const progress = seconds === 0 ? 1 : remainingMs / (seconds * 1000);
  return { seconds, remainingMs, progress, cycleSeconds };
}
