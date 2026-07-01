"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flatLessons, lessonKey, totalLessons } from "./curriculum";

type ProgressState = {
  completed: Record<string, boolean>;
  scores: Record<string, { correct: number; total: number }>;
};

type ProgressCtx = ProgressState & {
  ready: boolean;
  isDone: (trackId: string, lessonId: string) => boolean;
  markDone: (trackId: string, lessonId: string) => void;
  recordScore: (
    trackId: string,
    lessonId: string,
    correct: number,
    total: number,
  ) => void;
  reset: () => void;
  completedCount: number;
  percent: number;
  trackPercent: (trackId: string) => number;
};

const KEY = "1claw-teach-progress-v1";
const Ctx = createContext<ProgressCtx | null>(null);

const empty: ProgressState = { completed: {}, scores: {} };

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const isDone = useCallback(
    (t: string, l: string) => !!state.completed[lessonKey(t, l)],
    [state.completed],
  );

  const markDone = useCallback(
    (t: string, l: string) => {
      const k = lessonKey(t, l);
      if (state.completed[k]) return;
      persist({ ...state, completed: { ...state.completed, [k]: true } });
    },
    [state, persist],
  );

  const recordScore = useCallback(
    (t: string, l: string, correct: number, total: number) => {
      const k = lessonKey(t, l);
      persist({
        completed: { ...state.completed, [k]: true },
        scores: { ...state.scores, [k]: { correct, total } },
      });
    },
    [state, persist],
  );

  const reset = useCallback(() => persist(empty), [persist]);

  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const percent = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const trackPercent = useCallback(
    (trackId: string) => {
      const inTrack = flatLessons.filter((l) => l.trackId === trackId);
      if (!inTrack.length) return 0;
      const done = inTrack.filter(
        (l) => state.completed[lessonKey(l.trackId, l.lessonId)],
      ).length;
      return Math.round((done / inTrack.length) * 100);
    },
    [state.completed],
  );

  return (
    <Ctx.Provider
      value={{
        ...state,
        ready,
        isDone,
        markDone,
        recordScore,
        reset,
        completedCount,
        percent,
        trackPercent,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
