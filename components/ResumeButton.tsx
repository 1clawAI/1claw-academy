"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { flatLessons } from "@/lib/curriculum";

export function ResumeButton() {
  const { ready, isDone, completedCount } = useProgress();
  if (!ready || completedCount === 0) return null;

  const nextUp =
    flatLessons.find((l) => !isDone(l.trackId, l.lessonId)) ??
    flatLessons[flatLessons.length - 1];

  return (
    <Link
      href={`/learn/${nextUp.trackId}/${nextUp.lessonId}`}
      className="rounded-xl border border-[var(--success)]/50 bg-[var(--success)]/10 px-6 py-3 font-medium text-[var(--success)] transition hover:bg-[var(--success)]/20"
    >
      Resume: {nextUp.lessonTitle} →
    </Link>
  );
}
