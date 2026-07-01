import type { Track, LessonRef, Lesson } from "./types";
import { trackMeta } from "./content/meta";

import foundations from "./content/track-foundations.json";
import workingWithSecrets from "./content/track-working-with-secrets.json";
import agentsAccess from "./content/track-agents-access.json";
import advancedSecurity from "./content/track-advanced-security.json";
import transactionsTreasury from "./content/track-transactions-treasury.json";
import complianceOps from "./content/track-compliance-ops.json";
import ecosystem from "./content/track-ecosystem.json";

const lessonsById: Record<string, Lesson[]> = {
  foundations: foundations as unknown as Lesson[],
  "working-with-secrets": workingWithSecrets as unknown as Lesson[],
  "agents-access": agentsAccess as unknown as Lesson[],
  "advanced-security": advancedSecurity as unknown as Lesson[],
  "transactions-treasury": transactionsTreasury as unknown as Lesson[],
  "compliance-ops": complianceOps as unknown as Lesson[],
  ecosystem: ecosystem as unknown as Lesson[],
};

export const tracks: Track[] = trackMeta.map((m) => ({
  ...m,
  lessons: lessonsById[m.id] ?? [],
}));

export const flatLessons: LessonRef[] = (() => {
  const out: LessonRef[] = [];
  let i = 0;
  for (const t of tracks) {
    for (const l of t.lessons) {
      out.push({
        trackId: t.id,
        trackTitle: t.title,
        level: t.level,
        lessonId: l.id,
        lessonTitle: l.title,
        summary: l.summary,
        index: i++,
      });
    }
  }
  return out;
})();

export const totalLessons = flatLessons.length;

export const totalQuestions = tracks.reduce(
  (n, t) => n + t.lessons.reduce((m, l) => m + (l.quiz?.length ?? 0), 0),
  0,
);

export function getTrack(trackId: string): Track | undefined {
  return tracks.find((t) => t.id === trackId);
}

export function getLesson(trackId: string, lessonId: string): Lesson | undefined {
  return getTrack(trackId)?.lessons.find((l) => l.id === lessonId);
}

export function lessonKey(trackId: string, lessonId: string) {
  return `${trackId}/${lessonId}`;
}

export function getAdjacent(trackId: string, lessonId: string) {
  const idx = flatLessons.findIndex(
    (l) => l.trackId === trackId && l.lessonId === lessonId,
  );
  return {
    current: flatLessons[idx],
    prev: idx > 0 ? flatLessons[idx - 1] : undefined,
    next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : undefined,
  };
}

export const allTrackParams = tracks.flatMap((t) =>
  t.lessons.map((l) => ({ track: t.id, lesson: l.id })),
);
