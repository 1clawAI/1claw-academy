"use client";

import { useEffect, useState } from "react";
import { List, X } from "lucide-react";
import { LessonSidebar } from "./LessonSidebar";

/**
 * Course contents as a slide-over on small screens, where the desktop sidebar
 * is hidden. Without this the only navigation on a phone is prev/next.
 */
export function MobileContents({
  trackId,
  lessonId,
}: {
  trackId: string;
  lessonId: string;
}) {
  const [open, setOpen] = useState(false);
  const [lastLesson, setLastLesson] = useState(lessonId);

  // Close when navigating to another lesson. Adjusting during render avoids the
  // cascading re-render an effect would cause.
  if (lessonId !== lastLesson) {
    setLastLesson(lessonId);
    setOpen(false);
  }

  // Lock background scroll and wire Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)] lg:hidden"
        aria-label="Open course contents"
      >
        <List size={14} />
        Contents
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="h-full w-[19rem] max-w-[85vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Course contents"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-accessible)]">
                Contents
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close contents"
                className="rounded-md p-1 text-[var(--muted)] transition hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>
            <LessonSidebar trackId={trackId} lessonId={lessonId} />
          </div>
        </div>
      ) : null}
    </>
  );
}
