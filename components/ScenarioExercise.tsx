"use client";

import { useState } from "react";
import { Check, X, Lightbulb } from "lucide-react";
import type { ScenarioOption } from "@/lib/types";

/**
 * Formative, applied exercise placed inside a lesson rather than after it.
 *
 * Unlike the end-of-lesson quiz, every option carries feedback, so choosing a
 * plausible-but-wrong answer teaches something specific about why the reasoning
 * fails. Wrong answers stay selectable afterwards so the reader can explore the
 * branches they did not take.
 */
export function ScenarioExercise({
  situation,
  question,
  options,
}: {
  situation: string;
  question: string;
  options: ScenarioOption[];
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const pick = (i: number) => {
    setChosen(i);
    setSeen((s) => new Set(s).add(i));
  };

  const answered = chosen !== null;
  const gotIt = answered && options[chosen]?.correct;

  return (
    <section className="card my-6 p-5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        <Lightbulb size={14} />
        Decide
      </p>
      <p className="mt-3 leading-relaxed text-[var(--prose-fg)]">{situation}</p>
      <p className="mt-3 font-medium">{question}</p>

      <ul className="mt-4 space-y-2">
        {options.map((o, i) => {
          const isChosen = chosen === i;
          const explored = seen.has(i);
          let cls =
            "border-[var(--border)] hover:border-[var(--signature)]/50 hover:bg-[var(--hover)]";
          if (explored && o.correct)
            cls = "border-[var(--success)] bg-[var(--success)]/10";
          else if (explored && !o.correct)
            cls = "border-[var(--danger)]/60 bg-[var(--danger)]/5";
          return (
            <li key={i}>
              <button
                onClick={() => pick(i)}
                aria-pressed={isChosen}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}
              >
                <span className="flex items-start gap-2">
                  {explored ? (
                    o.correct ? (
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--success)]"
                      />
                    ) : (
                      <X
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--danger)]"
                      />
                    )
                  ) : (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted)]" />
                  )}
                  <span>{o.text}</span>
                </span>
                {isChosen ? (
                  <span className="mt-2 block pl-6 leading-relaxed text-[var(--prose-fg)]">
                    {o.feedback}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {answered ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {gotIt
            ? "Correct. The other options are still worth opening: each fails for a different reason."
            : "Not quite. Try another, or open the rest to see how each one fails."}
        </p>
      ) : null}
    </section>
  );
}
