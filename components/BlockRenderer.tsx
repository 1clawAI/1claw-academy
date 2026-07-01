import type { Block } from "@/lib/types";
import { CodeBlock } from "./CodeBlock";
import { Icon, type IconName } from "./Icon";

const calloutStyle: Record<
  "info" | "tip" | "warn",
  { border: string; icon: IconName; label: string }
> = {
  info: { border: "var(--primary)", icon: "info", label: "Concept" },
  tip: { border: "var(--success)", icon: "tip", label: "Tip" },
  warn: { border: "var(--warn)", icon: "warn", label: "Watch out" },
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-body space-y-6">
      {blocks.map((b, i) => {
        if (b.type === "prose") return <p key={i}>{renderInline(b.text)}</p>;

        if (b.type === "code")
          return (
            <CodeBlock key={i} code={b.code} lang={b.lang} caption={b.caption} />
          );

        if (b.type === "points")
          return (
            <ul key={i} className="space-y-3">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="leading-relaxed text-[#d6d3d6]">
                    {renderInline(it)}
                  </span>
                </li>
              ))}
            </ul>
          );

        if (b.type === "steps")
          return (
            <ol key={i} className="space-y-0">
              {b.steps.map((s, j) => (
                <li key={j} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* connector line */}
                  {j < b.steps.length - 1 ? (
                    <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--border)]" />
                  ) : null}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--primary)]/40 bg-[var(--surface)] font-mono text-sm font-semibold text-[var(--primary-2)]">
                    {j + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="leading-relaxed text-[#d6d3d6]">
                      {renderInline(s.text)}
                    </p>
                    {s.code ? (
                      <CodeBlock code={s.code} lang={s.lang} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          );

        // callout
        const s = calloutStyle[b.variant];
        return (
          <div
            key={i}
            className="rounded-xl border px-4 py-3"
            style={{
              borderColor: `color-mix(in srgb, ${s.border} 40%, transparent)`,
              background: `color-mix(in srgb, ${s.border} 8%, transparent)`,
            }}
          >
            <div
              className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: s.border }}
            >
              <Icon name={s.icon} size={14} /> {s.label}
            </div>
            <p className="text-sm leading-relaxed text-[#dfe2ee]">
              {renderInline(b.text)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Render inline `code` spans (backtick).
function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      return <code key={i}>{p.slice(1, -1)}</code>;
    }
    return <span key={i}>{p}</span>;
  });
}
