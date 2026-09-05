import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#030304";
const FG = "#ffffff";
const MUTED = "#8b8b93";
const SIGNATURE = "#df171a";

/**
 * Shared Open Graph card. Rendered on the brand's matte black so it reads the
 * same wherever it is unfurled — social clients composite the image onto their
 * own surface and send no theme signal, so one self-contained card is correct.
 */
export function OgCard({
  eyebrow,
  title,
  subtitle,
  accent = SIGNATURE,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: "72px 80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Signature glow, mirroring the site's hero treatment */}
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -160,
          width: 760,
          height: 620,
          borderRadius: 9999,
          background: "rgba(223,23,26,0.20)",
          filter: "blur(120px)",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${SIGNATURE}, #990029)`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", fontSize: 26, color: FG, fontWeight: 700 }}>
          1Claw
        </div>
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>Academy</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: accent,
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 52 ? 60 : 74,
            lineHeight: 1.08,
            color: FG,
            fontWeight: 700,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 27,
              lineHeight: 1.4,
              color: MUTED,
              marginTop: 24,
              maxWidth: 960,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", width: 44, height: 3, background: accent }} />
        <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
          academy.1claw.co
        </div>
      </div>
    </div>
  );
}
