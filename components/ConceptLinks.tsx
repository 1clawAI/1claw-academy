import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { ConceptLink } from "@/lib/types";
import { getLesson, getTrack } from "@/lib/curriculum";

/**
 * "Builds on" strip shown above a lesson body. Links a product lesson back to
 * the concept lessons it assumes, so the two halves of the course connect.
 */
export function ConceptLinks({ concepts }: { concepts?: ConceptLink[] }) {
  if (!concepts?.length) return null;

  const resolved = concepts
    .map((c) => {
      const track = getTrack(c.trackId);
      const lesson = getLesson(c.trackId, c.lessonId);
      return track && lesson ? { ...c, track, lesson } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (!resolved.length) return null;

  return (
    <aside className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        <GraduationCap size={14} />
        Builds on
      </p>
      <ul className="mt-3 space-y-2">
        {resolved.map((c) => (
          <li key={`${c.trackId}/${c.lessonId}`}>
            <Link
              href={`/learn/${c.trackId}/${c.lessonId}`}
              className="group flex flex-wrap items-baseline gap-x-2 text-sm"
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: c.track.accent }}
              />
              <span className="font-medium text-[var(--foreground)] decoration-[var(--signature)] underline-offset-4 transition group-hover:underline">
                {c.lesson.title}
              </span>
              <span className="text-[var(--muted)]">— {c.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
