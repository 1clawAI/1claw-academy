import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  allTrackParams,
  getAdjacent,
  getLesson,
  getTrack,
  flatLessons,
} from "@/lib/curriculum";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return allTrackParams;
}

type Params = { params: Promise<{ track: string; lesson: string }> };

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { track, lesson } = await params;
  const l = getLesson(track, lesson);
  if (!l) return { title: "Not found · 1Claw Academy" };
  return {
    title: `${l.title} · 1Claw Academy`,
    description: l.summary,
  };
}

export default async function LessonPage({ params }: Params) {
  const { track, lesson } = await params;
  const t = getTrack(track);
  const l = getLesson(track, lesson);
  if (!t || !l) notFound();

  const { prev, next } = getAdjacent(track, lesson);
  const lessonsInTrack = flatLessons.filter((x) => x.trackId === track);
  const current =
    lessonsInTrack.findIndex((x) => x.lessonId === lesson) + 1;

  return (
    <LessonView
      lesson={l}
      trackId={t.id}
      trackTitle={t.title}
      level={t.level}
      prev={prev}
      next={next}
      position={{ current, total: lessonsInTrack.length }}
    />
  );
}
