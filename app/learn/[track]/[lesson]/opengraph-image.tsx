import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { allTrackParams, getLesson, getTrack } from "@/lib/curriculum";

export const alt = "1Claw Academy lesson";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return allTrackParams;
}

export default async function Image({
  params,
}: {
  params: Promise<{ track: string; lesson: string }>;
}) {
  const { track, lesson } = await params;
  const t = getTrack(track);
  const l = getLesson(track, lesson);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={t?.title ?? "Lesson"}
        title={l?.title ?? "1Claw Academy"}
        subtitle={l?.summary}
        accent={t?.accent}
      />
    ),
    size,
  );
}
