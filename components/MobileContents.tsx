"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Close when navigating to another lesson. Adjusting during render avoids the
  // cascading re-render an effect would cause.
  if (lessonId !== lastLesson) {
    setLastLesson(lessonId);
    setOpen(false);
  }

  const openDrawer = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement;
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    restoreRef.current?.focus?.();
  }, []);

  // Lock background scroll, wire Escape, and move focus into the dialog —
  // aria-modal="true" is a promise to assistive tech that focus stays
  // contained; without this a keyboard user could tab straight into the
  // page behind the overlay.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeDrawer]);

  const trapTab = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  return (
    <>
      <button
        onClick={openDrawer}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)] lg:hidden"
        aria-label="Open course contents"
      >
        <List size={14} />
        Contents
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className="h-full w-[19rem] max-w-[85vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] p-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trapTab}
            role="dialog"
            aria-modal="true"
            aria-label="Course contents"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-accessible)]">
                Contents
              </span>
              <button
                ref={closeButtonRef}
                onClick={closeDrawer}
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
