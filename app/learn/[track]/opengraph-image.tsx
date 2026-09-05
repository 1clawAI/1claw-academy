import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { tracks, getTrack } from "@/lib/curriculum";

export const alt = "1Claw Academy track";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return tracks.map((t) => ({ track: t.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const t = getTrack(track);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={t ? `${t.level} · ${t.lessons.length} lessons` : "Track"}
        title={t?.title ?? "1Claw Academy"}
        subtitle={t?.tagline}
        accent={t?.accent}
      />
    ),
    size,
  );
}
