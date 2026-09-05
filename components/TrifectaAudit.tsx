"use client";

import { useState } from "react";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";
import type { AuditTool, Circle } from "@/lib/types";

const CIRCLES: { id: Circle; label: string; short: string }[] = [
  { id: "private-data", label: "Private data", short: "reads something worth stealing" },
  { id: "untrusted-content", label: "Untrusted content", short: "processes attacker-influenced input" },
  { id: "external-comms", label: "External comms", short: "can get data out" },
];

const same = (a: Circle[], b: Circle[]) =>
  a.length === b.length && a.every((c) => b.includes(c));

/**
 * Applied exercise for the lethal trifecta: classify each granted capability,
 * then see whether the configuration is exploitable. Recall questions test
 * whether you remember the three circles; this tests whether you can spot them.
 */
export function TrifectaAudit({
  scenario,
  tools,
  verdict,
}: {
  scenario: string;
  tools: AuditTool[];
  verdict: string;
}) {
  const [picked, setPicked] = useState<Record<number, Circle[]>>({});
  const [checked, setChecked] = useState(false);

  const toggle = (ti: number, c: Circle) => {
    if (checked) return;
    setPicked((p) => {
      const cur = p[ti] ?? [];
      return {
        ...p,
        [ti]: cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
      };
    });
  };

  // Which circles the configuration actually closes, across all tools.
  const present = new Set(tools.flatMap((t) => t.circles));
  const exploitable = CIRCLES.every((c) => present.has(c.id));
  const correctCount = tools.filter((t, i) =>
    same(t.circles, picked[i] ?? []),
  ).length;

  return (
    <section className="card my-6 p-5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        <ShieldAlert size={14} />
        Audit this configuration
      </p>
      <p className="mt-3 leading-relaxed text-[var(--prose-fg)]">{scenario}</p>
      <p className="mt-3 text-sm text-[var(--muted)]">
        For each capability, mark every circle it contributes. Some contribute
        none.
      </p>

      <ul className="mt-4 space-y-3">
        {tools.map((t, ti) => {
          const mine = picked[ti] ?? [];
          const right = same(t.circles, mine);
          return (
            <li
              key={t.name}
              className={`rounded-xl border p-4 transition ${
                checked
                  ? right
                    ? "border-[var(--success)]/50 bg-[var(--success)]/5"
                    : "border-[var(--danger)]/50 bg-[var(--danger)]/5"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-start gap-2">
                <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-xs text-[var(--signature-soft)]">
                  {t.name}
                </code>
                {checked ? (
                  right ? (
                    <Check size={15} className="mt-0.5 text-[var(--success)]" />
                  ) : (
                    <X size={15} className="mt-0.5 text-[var(--danger)]" />
                  )
                ) : null}
              </div>
              <p className="mt-1.5 text-sm text-[var(--muted)]">
                {t.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {CIRCLES.map((c) => {
                  const on = mine.includes(c.id);
                  const should = t.circles.includes(c.id);
                  let cls =
                    "border-[var(--border)] text-[var(--muted)] hover:border-[var(--signature)]/50";
                  if (checked && should)
                    cls =
                      "border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]";
                  else if (checked && on && !should)
                    cls =
                      "border-[var(--danger)] bg-[var(--danger)]/15 text-[var(--danger)]";
                  else if (on)
                    cls =
                      "border-[var(--signature)] bg-[var(--signature)]/10 text-[var(--foreground)]";
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(ti, c.id)}
                      aria-pressed={on}
                      disabled={checked}
                      title={c.short}
                      className={`rounded-full border px-3 py-1 text-xs transition disabled:cursor-default ${cls}`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {checked ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--prose-fg)]">
                  {t.rationale}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--signature)]"
        >
          Check the audit
        </button>
      ) : (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            exploitable
              ? "border-[var(--danger)]/50 bg-[var(--danger)]/5"
              : "border-[var(--success)]/50 bg-[var(--success)]/5"
          }`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            {exploitable ? (
              <>
                <ShieldAlert size={15} className="text-[var(--danger)]" />
                All three circles are present — exploitable
              </>
            ) : (
              <>
                <ShieldCheck size={15} className="text-[var(--success)]" />
                A circle is missing — the chain breaks
              </>
            )}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--prose-fg)]">
            {verdict}
          </p>
          <p className="mt-3 font-mono text-xs text-[var(--muted)]">
            {correctCount}/{tools.length} capabilities classified correctly
          </p>
        </div>
      )}
    </section>
  );
}
