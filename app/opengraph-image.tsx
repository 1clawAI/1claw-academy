import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { totalLessons } from "@/lib/curriculum";

export const alt = "1Claw Academy — a course on AI security";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Interactive course"
        title="Learn AI security, from first principles to production"
        subtitle={`${totalLessons} lessons — cryptography and access control, the agent threat model, then hands-on defences.`}
      />
    ),
    size,
  );
}
