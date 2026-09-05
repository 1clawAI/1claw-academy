"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
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

/*
 * Progress lives in localStorage, which is an external store. Reading it with
 * useSyncExternalStore rather than hydrating through an effect avoids the extra
 * render pass, and subscribing to `storage` keeps two open tabs in agreement.
 *
 * getSnapshot must be referentially stable between reads, so the parsed value is
 * cached against the raw string it came from.
 */
let cache: ProgressState = empty;
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function readStore(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      cache = raw ? { ...empty, ...JSON.parse(raw) } : empty;
    }
  } catch {
    /* private mode or malformed JSON: fall back to whatever we last had */
  }
  return cache;
}

function writeStore(next: ProgressState) {
  cache = next;
  try {
    cacheRaw = JSON.stringify(next);
    localStorage.setItem(KEY, cacheRaw);
  } catch {
    /* ignore: progress just will not persist */
  }
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// On the server there is no store; `ready` flips once the client has read it.
const serverState = () => empty;
const clientReady = () => true;
const serverReady = () => false;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, readStore, serverState);
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);

  const persist = useCallback((next: ProgressState) => writeStore(next), []);

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
