import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tracks, getTrack } from "@/lib/curriculum";
import { TrackView } from "@/components/TrackView";

export function generateStaticParams() {
  return tracks.map((t) => ({ track: t.id }));
}

type Params = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { track } = await params;
  const t = getTrack(track);
  if (!t) return { title: "Not found · 1Claw Academy" };
  return {
    title: `${t.title} · 1Claw Academy`,
    description: `${t.tagline} By the end you'll be able to ${t.outcome}`,
  };
}

export default async function TrackPage({ params }: Params) {
  const { track } = await params;
  const t = getTrack(track);
  if (!t) notFound();
  const i = tracks.findIndex((x) => x.id === track);
  return (
    <TrackView
      track={t}
      index={i}
      prev={i > 0 ? tracks[i - 1] : undefined}
      next={i < tracks.length - 1 ? tracks[i + 1] : undefined}
    />
  );
}
