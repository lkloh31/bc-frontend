import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "memory_best_time_v1"; // change if you want per-difficulty keys

export function useGameTimer({ autostart = false } = {}) {
  const [isRunning, setIsRunning] = useState(autostart);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestMs, setBestMs] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  });

  const startRef = useRef(null);
  const rafRef = useRef(null);

  const tick = () => {
    if (startRef.current == null) return;
    setElapsedMs(performance.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    startRef.current = performance.now() - elapsedMs; // resume support
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsRunning(false);
    startRef.current = null;
    setElapsedMs(0);
  };

  // when a run completes, update best time
  const finalizeRun = () => {
    stop();
    setBestMs((prev) => {
      const next = prev == null ? elapsedMs : Math.min(prev, elapsedMs);
      if (prev == null || next < prev) {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    isRunning,
    elapsedMs,
    bestMs,
    start,
    stop,
    reset,
    finalizeRun,
  };
}

// helper to format mm:ss.mmm (or mm:ss)
export function formatTime(ms, { showMillis = false } = {}) {
  if (ms == null) return "—";
  const total = Math.floor(ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return showMillis ? `${mm}:${ss}.${String(millis).padStart(3, "0")}` : `${mm}:${ss}`;
}
