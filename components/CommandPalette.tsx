"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { tracks } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { Icon, type IconName } from "./Icon";

type Entry = {
  trackId: string;
  trackTitle: string;
  trackIcon: string;
  accent: string;
  lessonId: string;
  title: string;
  summary: string;
  haystack: string;
};

// Built once at module scope — the curriculum is static.
const ENTRIES: Entry[] = tracks.flatMap((t) =>
  t.lessons.map((l) => ({
    trackId: t.id,
    trackTitle: t.title,
    trackIcon: t.icon,
    accent: t.accent,
    lessonId: l.id,
    title: l.title,
    summary: l.summary,
    haystack: `${t.title} ${l.title} ${l.summary}`.toLowerCase(),
  })),
);

/** Ranks by where the match lands: title beats summary beats track name. */
function score(e: Entry, q: string): number {
  const title = e.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (e.summary.toLowerCase().includes(q)) return 3;
  if (e.haystack.includes(q)) return 4;
  return -1;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [lastQuery, setLastQuery] = useState(query);
  const router = useRouter();
  const { isDone, ready } = useProgress();
  const listRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ENTRIES.slice(0, 8);
    return ENTRIES.map((e) => ({ e, s: score(e, q) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => a.s - b.s)
      .slice(0, 12)
      .map((r) => r.e);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    // Return focus to whatever opened the palette.
    restoreRef.current?.focus?.();
  }, []);

  const go = useCallback(
    (e: Entry) => {
      close();
      router.push(`/learn/${e.trackId}/${e.lessonId}`);
    },
    [close, router],
  );

  // Global open shortcut.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOpen((o) => {
          if (!o) restoreRef.current = document.activeElement as HTMLElement;
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset the highlight when the result set changes under it. Adjusting during
  // render is the supported pattern here — an effect would cascade a render.
  if (query !== lastQuery) {
    setLastQuery(query);
    setActive(0);
  }

  // Keep the highlighted row in view.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--scrim)] px-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
      role="presentation"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search lessons"
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search size={16} className="shrink-0 text-[var(--muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                go(results[active]);
              }
            }}
            placeholder="Search 63 lessons — try 'injection', 'rotate', 'MPC'…"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-[var(--muted)]"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              No lessons match “{query}”.
            </p>
          ) : (
            results.map((e, i) => {
              const done = ready && isDone(e.trackId, e.lessonId);
              return (
                <button
                  key={`${e.trackId}/${e.lessonId}`}
                  data-idx={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(e)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    i === active ? "bg-[var(--hover-strong)]" : ""
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: `color-mix(in srgb, ${e.accent} 16%, transparent)`,
                      color: e.accent,
                    }}
                  >
                    <Icon name={e.trackIcon as IconName} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {e.title}
                      </span>
                      {done ? (
                        <Icon
                          name="check"
                          size={12}
                          className="shrink-0 text-[var(--success)]"
                        />
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-[var(--muted)]">
                      {e.trackTitle}
                    </span>
                  </span>
                  {i === active ? (
                    <CornerDownLeft
                      size={13}
                      className="shrink-0 text-[var(--muted)]"
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
