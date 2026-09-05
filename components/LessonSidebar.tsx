"use client";

import Link from "next/link";
import { tracks } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { Icon, type IconName } from "./Icon";

/**
 * Track-scoped contents for the lesson page. Shows the current track expanded
 * with completion state, and the neighbouring tracks collapsed to one line so
 * the reader keeps a sense of the whole course.
 */
export function LessonSidebar({
  trackId,
  lessonId,
}: {
  trackId: string;
  lessonId: string;
}) {
  const { isDone, ready } = useProgress();
  const idx = tracks.findIndex((t) => t.id === trackId);

  return (
    <nav
      aria-label="Course contents"
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 text-sm"
    >
      {tracks.map((t, ti) => {
        const isCurrent = t.id === trackId;
        // Collapse tracks that are far from the current one.
        if (!isCurrent && Math.abs(ti - idx) > 1) {
          return (
            <Link
              key={t.id}
              href={`/learn/${t.id}/${t.lessons[0].id}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <span className="font-mono opacity-60">
                {String(ti + 1).padStart(2, "0")}
              </span>
              <span className="truncate">{t.title}</span>
            </Link>
          );
        }
        return (
          <div key={t.id} className={isCurrent ? "my-2" : "my-1"}>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{
                  background: `color-mix(in srgb, ${t.accent} 16%, transparent)`,
                  color: t.accent,
                }}
              >
                <Icon name={t.icon as IconName} size={11} />
              </span>
              <span
                className={`truncate text-xs font-semibold ${
                  isCurrent ? "" : "text-[var(--muted)]"
                }`}
              >
                {t.title}
              </span>
            </div>
            {isCurrent ? (
              <ul className="ml-3 border-l border-[var(--border)]">
                {t.lessons.map((l) => {
                  const here = l.id === lessonId;
                  const done = ready && isDone(t.id, l.id);
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${t.id}/${l.id}`}
                        aria-current={here ? "page" : undefined}
                        className={`-ml-px flex items-start gap-2 border-l-2 py-1.5 pl-3 pr-2 text-xs leading-snug transition ${
                          here
                            ? "border-[var(--signature)] font-medium text-[var(--foreground)]"
                            : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {done ? (
                            <Icon
                              name="check"
                              size={11}
                              className="text-[var(--success)]"
                            />
                          ) : (
                            <span className="block h-[11px] w-[11px]" />
                          )}
                        </span>
                        <span className="min-w-0">{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
