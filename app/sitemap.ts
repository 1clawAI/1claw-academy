import type { MetadataRoute } from "next";
import { tracks } from "@/lib/curriculum";

const BASE = "https://academy.1claw.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const trackPages = tracks.map((t) => ({
    url: `${BASE}/learn/${t.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const lessons = tracks.flatMap((t) =>
    t.lessons.map((l) => ({
      url: `${BASE}/learn/${t.id}/${l.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/learn`, changeFrequency: "weekly", priority: 0.9 },
    ...trackPages,
    ...lessons,
  ];
}
