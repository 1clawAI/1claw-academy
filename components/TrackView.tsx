"use client";

import Link from "next/link";
import { Clock, Target } from "lucide-react";
import type { Track } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { Icon, type IconName } from "./Icon";
import { KindBadge } from "./KindBadge";
import { readingMinutes } from "@/lib/reading";

export function TrackView({
  track,
  index,
  prev,
  next,
}: {
  track: Track;
  index: number;
  prev?: Track;
  next?: Track;
}) {
  const { isDone, ready, trackPercent } = useProgress();
  const pct = ready ? trackPercent(track.id) : 0;
  const totalMin = track.lessons.reduce(
    (n, l) => n + readingMinutes(l.blocks),
    0,
  );
  const firstUndone =
    (ready && track.lessons.find((l) => !isDone(track.id, l.id))) ||
    track.lessons[0];
  const started = ready && pct > 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link
        href="/learn"
        className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        ← Curriculum
      </Link>

      <header className="mt-5 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${track.accent} 14%, transparent)`,
            color: track.accent,
          }}
        >
          <Icon name={track.icon as IconName} size={26} />
        </div>
        <div className="min-w-0">
          <span className="eyebrow" data-index={String(index + 1).padStart(2, "0")}>
            {track.level}
          </span>
          <h1 className="section-title mt-2">{track.title}</h1>
          <p className="section-sub mt-2">{track.tagline}</p>
        </div>
      </header>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <Target size={14} />
          By the end of this track
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--prose-fg)]">
          You&rsquo;ll be able to {track.outcome}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
        <span className="font-mono">{track.lessons.length} lessons</span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          <span className="font-mono">~{totalMin} min</span>
        </span>
        <span className="font-mono">
          {track.lessons.reduce((n, l) => n + l.quiz.length, 0)} questions
        </span>
        {started ? (
          <span className="ml-auto flex items-center gap-2">
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: track.accent }}
              />
            </span>
            <span className="font-mono text-xs">{pct}%</span>
          </span>
        ) : null}
      </div>

      <Link
        href={`/learn/${track.id}/${firstUndone.id}`}
        className="mt-6 inline-block rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--signature)]"
      >
        {started ? "Continue" : "Start"} → {firstUndone.title}
      </Link>

      <ol className="mt-10 overflow-hidden rounded-xl border border-[var(--border)]">
        {track.lessons.map((l, i) => {
          const done = ready && isDone(track.id, l.id);
          return (
            <li key={l.id}>
              <Link
                href={`/learn/${track.id}/${l.id}`}
                className="flex items-start gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 transition last:border-0 hover:bg-[var(--surface-2)]"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    done
                      ? "border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {done ? <Icon name="check" size={13} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {l.title}
                    <KindBadge kind={l.kind} size="sm" />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">
                    {l.summary}
                  </span>
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-[var(--muted)] sm:block">
                  {readingMinutes(l.blocks)} min
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <nav className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-sm">
        {prev ? (
          <Link href={`/learn/${prev.id}`} className="group flex flex-col">
            <span className="text-xs text-[var(--muted)]">← Previous track</span>
            <span className="font-medium transition group-hover:text-[var(--signature-soft)]">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.id}`}
            className="group flex flex-col text-right"
          >
            <span className="text-xs text-[var(--muted)]">Next track →</span>
            <span className="font-medium transition group-hover:text-[var(--signature-soft)]">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
