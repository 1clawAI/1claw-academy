"use client";

import Link from "next/link";
import { tracks, totalLessons } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { Icon, type IconName } from "./Icon";

export function CurriculumView() {
  const { isDone, ready, trackPercent, completedCount, percent, reset } =
    useProgress();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
          <p className="mt-2 text-[var(--muted)]">
            {tracks.length} tracks · {totalLessons} lessons, beginner to
            advanced.
          </p>
        </div>
        {ready && completedCount > 0 ? (
          <div className="text-right">
            <div className="font-mono text-sm text-[var(--muted)]">
              {completedCount}/{totalLessons} complete · {percent}%
            </div>
            <button
              onClick={() => {
                if (confirm("Reset all progress? This cannot be undone."))
                  reset();
              }}
              className="mt-1 text-xs text-[var(--muted)] underline transition hover:text-[var(--danger)]"
            >
              Reset progress
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-10 space-y-8">
        {tracks.map((t, ti) => {
          const tp = ready ? trackPercent(t.id) : 0;
          return (
            <section key={t.id}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${t.accent} 14%, transparent)`,
                    color: t.accent,
                  }}
                >
                  <Icon name={t.icon as IconName} size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      <span className="font-mono text-sm text-[var(--muted)]">
                        {String(ti + 1).padStart(2, "0")}.
                      </span>{" "}
                      {t.title}
                    </h2>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{
                        color: t.accent,
                        background: `color-mix(in srgb, ${t.accent} 12%, transparent)`,
                      }}
                    >
                      {t.level}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{t.tagline}</p>
                </div>
                {ready && tp > 0 ? (
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {tp}%
                  </span>
                ) : null}
              </div>

              <ul className="overflow-hidden rounded-xl border border-[var(--border)]">
                {t.lessons.map((l, li) => {
                  const done = ready && isDone(t.id, l.id);
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${t.id}/${l.id}`}
                        className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition last:border-0 hover:bg-[var(--surface-2)]"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                            done
                              ? "border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]"
                              : "border-[var(--border)] text-[var(--muted)]"
                          }`}
                        >
                          {done ? <Icon name="check" size={13} /> : li + 1}
                        </span>
                        <span
                          className={`flex-1 text-sm ${
                            done ? "text-[var(--muted)]" : "font-medium"
                          }`}
                        >
                          {l.title}
                        </span>
                        <span className="hidden text-xs text-[var(--muted)] sm:block">
                          {l.quiz.length} Q
                        </span>
                        <span className="text-[var(--muted)]">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
