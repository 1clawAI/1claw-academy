import { FlaskConical, Trophy } from "lucide-react";

const STYLES = {
  lab: {
    Icon: FlaskConical,
    label: "Lab",
    color: "var(--success)",
    title: "Hands-on. Runs locally, no account needed.",
  },
  capstone: {
    Icon: Trophy,
    label: "Capstone",
    color: "var(--warn)",
    title: "Synthesis exercise for the whole track.",
  },
} as const;

/** Marks lessons that are not ordinary reading, so they stand out in a list. */
export function KindBadge({
  kind,
  size = "md",
}: {
  kind?: "lab" | "capstone";
  size?: "sm" | "md";
}) {
  if (!kind) return null;
  const { Icon, label, color, title } = STYLES[kind];
  const sm = size === "sm";
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-medium uppercase tracking-wide ${
        sm ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]"
      }`}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <Icon size={sm ? 9 : 11} />
      {label}
    </span>
  );
}
