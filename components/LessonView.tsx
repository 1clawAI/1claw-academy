"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Lesson, LessonRef } from "@/lib/types";
import { BlockRenderer } from "./BlockRenderer";
import { Quiz } from "./Quiz";
import { useProgress } from "@/lib/progress";

export function LessonView({
  lesson,
  trackId,
  trackTitle,
  level,
  prev,
  next,
  position,
}: {
  lesson: Lesson;
  trackId: string;
  trackTitle: string;
  level: string;
  prev?: LessonRef;
  next?: LessonRef;
  position: { current: number; total: number };
}) {
  const { recordScore, markDone, isDone, ready } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (ready) setDone(isDone(trackId, lesson.id));
  }, [ready, isDone, trackId, lesson.id]);

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 fadeup">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/learn"
          className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Curriculum
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--muted)]">{trackTitle}</span>
        <span className="ml-auto rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-[var(--muted)]">
          {level} · Lesson {position.current} of {position.total}
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {lesson.title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">
        {lesson.summary}
      </p>
      {done ? (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
          <Check size={13} /> Completed
        </div>
      ) : null}

      <div className="mt-8">
        <BlockRenderer blocks={lesson.blocks} />
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Check your understanding</h2>
          <span className="text-sm text-[var(--muted)]">
            {lesson.quiz.length} questions
          </span>
        </div>
        <Quiz
          key={lesson.id}
          questions={lesson.quiz}
          onComplete={(correct, total) => {
            recordScore(trackId, lesson.id, correct, total);
            setDone(true);
          }}
        />
      </section>

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
        {prev ? (
          <Link
            href={`/learn/${prev.trackId}/${prev.lessonId}`}
            className="group flex flex-col text-left"
          >
            <span className="text-xs text-[var(--muted)]">← Previous</span>
            <span className="text-sm font-medium transition group-hover:text-[var(--primary-2)]">
              {prev.lessonTitle}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.trackId}/${next.lessonId}`}
            onClick={() => markDone(trackId, lesson.id)}
            className="group flex flex-col text-right"
          >
            <span className="text-xs text-[var(--muted)]">Next →</span>
            <span className="text-sm font-medium transition group-hover:text-[var(--primary-2)]">
              {next.lessonTitle}
            </span>
          </Link>
        ) : (
          <Link
            href="/learn"
            onClick={() => markDone(trackId, lesson.id)}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--primary-2)]"
          >
            Finish → Back to curriculum
          </Link>
        )}
      </nav>
    </article>
  );
}
