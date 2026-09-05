"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { LessonSidebar } from "./LessonSidebar";
import { ConceptLinks } from "./ConceptLinks";
import { MobileContents } from "./MobileContents";
import type { Lesson, LessonRef } from "@/lib/types";
import { BlockRenderer } from "./BlockRenderer";
import { Quiz } from "./Quiz";
import { useProgress } from "@/lib/progress";
import { readingMinutes } from "@/lib/reading";

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
  const router = useRouter();

  const minutes = useMemo(() => readingMinutes(lesson.blocks), [lesson.blocks]);

  const goto = useCallback(
    (ref?: LessonRef) => {
      if (ref) router.push(`/learn/${ref.trackId}/${ref.lessonId}`);
    },
    [router],
  );

  // Left/right arrows move between lessons, unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable))
      )
        return;
      if (e.key === "ArrowLeft") goto(prev);
      else if (e.key === "ArrowRight") goto(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto, prev, next]);

  useEffect(() => {
    if (ready) setDone(isDone(trackId, lesson.id));
  }, [ready, isDone, trackId, lesson.id]);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5">
      <aside className="hidden w-60 shrink-0 py-10 lg:block">
        <LessonSidebar trackId={trackId} lessonId={lesson.id} />
      </aside>
      <article className="min-w-0 max-w-3xl flex-1 py-10 fadeup">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <MobileContents trackId={trackId} lessonId={lesson.id} />
        <Link
          href="/learn"
          className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Curriculum
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <Link
          href={`/learn/${trackId}`}
          className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          {trackTitle}
        </Link>
        <span className="ml-auto flex items-center gap-1.5 text-[var(--muted)]">
          <Clock size={12} />
          <span className="font-mono">{minutes} min</span>
        </span>
        <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-[var(--muted)]">
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

      <ConceptLinks concepts={lesson.concepts} />

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
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--signature)]"
          >
            Finish → Back to curriculum
          </Link>
        )}
      </nav>

      <p className="mt-6 hidden text-center text-xs text-[var(--muted)] lg:block">
        Tip: press{" "}
        <kbd className="rounded border border-[var(--border)] px-1 font-mono">
          ←
        </kbd>{" "}
        and{" "}
        <kbd className="rounded border border-[var(--border)] px-1 font-mono">
          →
        </kbd>{" "}
        to move between lessons, or{" "}
        <kbd className="rounded border border-[var(--border)] px-1 font-mono">
          ⌘K
        </kbd>{" "}
        to search.
      </p>
      </article>
    </div>
  );
}
