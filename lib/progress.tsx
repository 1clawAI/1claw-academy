"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { flatLessons, lessonKey, totalLessons, tracks } from "./curriculum";
import type { IconName } from "@/components/Icon";

type ProgressState = {
  completed: Record<string, boolean>;
  scores: Record<string, { correct: number; total: number }>;
  /** Set once, the first time every lesson is marked done. */
  completedAt?: string;
};

export type Tier = {
  name: string;
  icon: IconName;
  /** Minimum overall percent required to hold this tier. */
  min: number;
};

/** Ordered highest to lowest so the first match wins. */
export const TIERS: Tier[] = [
  { name: "1Claw Rockstar", icon: "tier-rockstar", min: 100 },
  { name: "Specialist", icon: "tier-specialist", min: 75 },
  { name: "Practitioner", icon: "tier-practitioner", min: 50 },
  { name: "Apprentice", icon: "tier-apprentice", min: 25 },
  { name: "Newcomer", icon: "tier-newcomer", min: 1 },
];

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
  trackGraduated: (trackId: string) => boolean;
  graduatedTrackCount: number;
  quizAccuracy: number; // 0-100, or -1 if no quiz has been scored yet
  quizCorrect: number;
  quizTotal: number;
  labsCompletedCount: number;
  totalLabs: number;
  tier: Tier | null; // null below the first tier's threshold
};

const KEY = "1claw-teach-progress-v1";
const Ctx = createContext<ProgressCtx | null>(null);

const empty: ProgressState = { completed: {}, scores: {} };

// Static for the life of the app — computed once from the bundled curriculum,
// not from anything a user can change.
const LAB_KEYS = tracks.flatMap((t) =>
  t.lessons
    .filter((l) => l.kind === "lab")
    .map((l) => lessonKey(t.id, l.id)),
);

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

/** Stamps completedAt the moment every lesson first becomes done, once. */
function withCompletionStamp(
  prevCompletedAt: string | undefined,
  nextCompleted: Record<string, boolean>,
): string | undefined {
  if (prevCompletedAt) return prevCompletedAt;
  const allDone = flatLessons.every(
    (l) => nextCompleted[lessonKey(l.trackId, l.lessonId)],
  );
  return allDone ? new Date().toISOString() : undefined;
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
      const completed = { ...state.completed, [k]: true };
      persist({
        ...state,
        completed,
        completedAt: withCompletionStamp(state.completedAt, completed),
      });
    },
    [state, persist],
  );

  const recordScore = useCallback(
    (t: string, l: string, correct: number, total: number) => {
      const k = lessonKey(t, l);
      const completed = { ...state.completed, [k]: true };
      persist({
        completed,
        scores: { ...state.scores, [k]: { correct, total } },
        completedAt: withCompletionStamp(state.completedAt, completed),
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

  const trackGraduated = useCallback(
    (trackId: string) => trackPercent(trackId) === 100,
    [trackPercent],
  );

  const graduatedTrackCount = useMemo(
    () => tracks.filter((t) => trackGraduated(t.id)).length,
    [trackGraduated],
  );

  const { quizCorrect, quizTotal } = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const s of Object.values(state.scores)) {
      correct += s.correct;
      total += s.total;
    }
    return { quizCorrect: correct, quizTotal: total };
  }, [state.scores]);
  const quizAccuracy = quizTotal ? Math.round((quizCorrect / quizTotal) * 100) : -1;

  const labsCompletedCount = useMemo(
    () => LAB_KEYS.filter((k) => state.completed[k]).length,
    [state.completed],
  );

  const tier = useMemo(
    () => TIERS.find((t) => percent >= t.min) ?? null,
    [percent],
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
        trackGraduated,
        graduatedTrackCount,
        quizAccuracy,
        quizCorrect,
        quizTotal,
        labsCompletedCount,
        totalLabs: LAB_KEYS.length,
        tier,
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
