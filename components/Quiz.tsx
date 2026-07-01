"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

export function Quiz({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const correctCount = useMemo(
    () =>
      questions.reduce(
        (n, q, i) =>
          submitted[i] && answers[i] === q.correctIndex ? n + 1 : n,
        0,
      ),
    [answers, submitted, questions],
  );

  const allDone = questions.every((_, i) => submitted[i]);
  const finished = allDone && questions.length > 0;

  const choose = (qi: number, oi: number) => {
    if (submitted[qi]) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  const check = (qi: number) => {
    if (answers[qi] === undefined) return;
    const next = { ...submitted, [qi]: true };
    setSubmitted(next);
    if (questions.every((_, i) => next[i])) {
      const correct = questions.reduce(
        (n, q, i) => (answers[i] === q.correctIndex ? n + 1 : n),
        0,
      );
      onComplete(correct, questions.length);
    }
  };

  return (
    <div className="mt-4 space-y-5">
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const isSub = submitted[qi];
        return (
          <div key={qi} className="card p-5">
            <div className="mb-3 flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--primary-2)]">
                {qi + 1}
              </span>
              <p className="font-medium text-[var(--foreground)]">{q.question}</p>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = q.correctIndex === oi;
                let cls =
                  "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-white/[0.02]";
                if (isSub && isCorrect)
                  cls =
                    "border-[var(--success)] bg-[var(--success)]/10 text-[var(--foreground)]";
                else if (isSub && isChosen && !isCorrect)
                  cls = "border-[var(--danger)] bg-[var(--danger)]/10";
                else if (!isSub && isChosen)
                  cls = "border-[var(--primary)] bg-[var(--primary)]/10";
                return (
                  <button
                    key={oi}
                    disabled={isSub}
                    onClick={() => choose(qi, oi)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition ${cls}`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                    {isSub && isCorrect ? (
                      <Check
                        size={16}
                        className="ml-auto text-[var(--success)]"
                      />
                    ) : isSub && isChosen && !isCorrect ? (
                      <X size={16} className="ml-auto text-[var(--danger)]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            {!isSub ? (
              <button
                onClick={() => check(qi)}
                disabled={chosen === undefined}
                className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-[var(--primary-2)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <div
                className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
                  chosen === q.correctIndex
                    ? "border-[var(--success)]/40 bg-[var(--success)]/5 text-[#a9ead9]"
                    : "border-[var(--warn)]/40 bg-[var(--warn)]/5 text-[#f2d7a8]"
                }`}
              >
                <span className="font-semibold">
                  {chosen === q.correctIndex ? "Correct. " : "Not quite. "}
                </span>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {finished ? (
        <div className="card border-[var(--primary)]/40 bg-[var(--primary)]/5 p-5 text-center fadeup">
          <p className="text-lg font-semibold">
            You scored {correctCount} / {questions.length}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {correctCount === questions.length
              ? "Perfect. Lesson mastered, and it's now marked complete."
              : "Lesson marked complete. Review the explanations above, then move on."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
