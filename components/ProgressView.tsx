"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check as CheckIcon } from "lucide-react";
import { tracks, totalLessons, totalQuestions } from "@/lib/curriculum";
import { useProgress, TIERS } from "@/lib/progress";
import { Icon, type IconName } from "./Icon";

const TIER_BLURB: Record<string, string> = {
  "1Claw Rockstar":
    "Every lesson, every track. You've been through the full arc from local vaults to a live control-plane audit.",
  Specialist:
    "Deep into the advanced tracks now — signing, treasury, and compliance are where most people slow down.",
  Practitioner:
    "Past the halfway point. The concept tracks and the early product tracks are behind you.",
  Apprentice:
    "Past the first quarter. The foundational ideas are starting to compound.",
  Newcomer: "Just getting started. The first few lessons are the hardest to begin, not the hardest to finish.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProgressView() {
  const {
    ready,
    completedCount,
    percent,
    tier,
    trackPercent,
    trackGraduated,
    graduatedTrackCount,
    quizAccuracy,
    quizCorrect,
    quizTotal,
    labsCompletedCount,
    totalLabs,
    completedAt,
    reset,
  } = useProgress();
  const [copied, setCopied] = useState(false);

  const isRockstar = percent === 100;

  const copySummary = async () => {
    const text = [
      `I completed 1Claw Academy: all ${totalLessons} lessons across ${tracks.length} tracks.`,
      `${totalQuestions} quiz questions · ${totalLabs} hands-on labs · ${quizAccuracy}% quiz accuracy.`,
      "🏆 1Claw Rockstar — https://academy.1claw.co",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the button just won't confirm, nothing to recover */
    }
  };

  if (!ready) {
    // Real stats live in localStorage, unreadable during SSR. Render the
    // page shell immediately instead of nothing, so first paint isn't
    // blocked on hydration — the real numbers swap in a moment later.
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow" data-index="✓">
          Your progress
        </p>
        <h1 className="section-title mt-3">Loading…</h1>
      </div>
    );
  }

  if (completedCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          No progress yet
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Achievements, tiers, and stats show up here once you complete your
          first lesson. Progress is tracked locally in this browser.
        </p>
        <Link
          href={`/learn/${tracks[0].id}/${tracks[0].lessons[0].id}`}
          className="mt-6 inline-block rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition hover:bg-[var(--signature)]"
        >
          Start the first lesson →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="eyebrow" data-index="✓">
        Your progress
      </p>
      <h1 className="section-title mt-3">
        {tier ? tier.name : "Getting started"}
      </h1>
      <p className="section-sub mt-2">
        {tier ? TIER_BLURB[tier.name] : "Every journey starts at zero."}
      </p>

      {/* Overall ring + stats */}
      <div className="card mt-8 flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: tier
                ? "color-mix(in srgb, var(--signature) 14%, transparent)"
                : "var(--surface-2)",
              color: tier ? "var(--signature)" : "var(--muted)",
            }}
          >
            <Icon name={(tier?.icon ?? "tier-newcomer") as IconName} size={30} />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums">{percent}%</div>
            <div className="text-xs text-[var(--muted)]">
              {completedCount}/{totalLessons} lessons
            </div>
          </div>
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--signature-soft)] to-[var(--signature)] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Quiz accuracy",
            value: quizTotal ? `${quizAccuracy}%` : "—",
            sub: quizTotal ? `${quizCorrect}/${quizTotal} correct` : "no quizzes yet",
          },
          {
            label: "Labs run",
            value: `${labsCompletedCount}/${totalLabs}`,
            sub: "hands-on exercises",
          },
          {
            label: "Tracks graduated",
            value: `${graduatedTrackCount}/${tracks.length}`,
            sub: "100% complete",
          },
          {
            label: "Current tier",
            value: tier ? tier.name.replace("1Claw ", "") : "—",
            sub: `of ${TIERS.length} tiers`,
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xl font-bold tabular-nums">{s.value}</div>
            <div className="mt-0.5 text-xs font-medium text-[var(--foreground)]">
              {s.label}
            </div>
            <div className="text-[11px] text-[var(--muted)]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Rockstar celebration */}
      {isRockstar ? (
        <div className="card mt-6 border-[var(--signature)]/40 bg-[var(--signature)]/5 p-6 text-center fadeup">
          <Icon
            name="tier-rockstar"
            size={32}
            className="mx-auto text-[var(--signature)]"
          />
          <p className="mt-3 text-lg font-semibold">
            You finished 1Claw Academy.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {totalLessons} lessons, {tracks.length} tracks, {totalLabs} labs,{" "}
            {totalQuestions} quiz questions
            {completedAt ? ` — completed ${formatDate(completedAt)}` : ""}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-[var(--muted)]">
            This is a personal completion summary tracked in your browser,
            not a verified credential — there is no account system behind it.
          </p>
          <button
            onClick={copySummary}
            className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--signature)]/50"
          >
            {copied ? (
              <>
                <CheckIcon size={14} className="text-[var(--success)]" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy shareable summary
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* Per-track breakdown */}
      <h2 className="mt-10 text-lg font-semibold">By track</h2>
      <ul className="mt-3 overflow-hidden rounded-xl border border-[var(--border)]">
        {tracks.map((t, i) => {
          const pct = trackPercent(t.id);
          const graduated = trackGraduated(t.id);
          return (
            <li key={t.id}>
              <Link
                href={`/learn/${t.id}`}
                className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition last:border-0 hover:bg-[var(--surface-2)]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `color-mix(in srgb, ${t.accent} 14%, transparent)`,
                    color: t.accent,
                  }}
                >
                  <Icon name={t.icon as IconName} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {t.title}
                    </span>
                    {graduated ? (
                      <span
                        title="100% complete"
                        className="flex items-center gap-1 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--success)]"
                      >
                        <Icon name="graduate" size={10} />
                        Graduate
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full max-w-[16rem] overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: t.accent }}
                    />
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-[var(--muted)]">
                  {pct}%
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
        <Link
          href="/learn"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← Back to curriculum
        </Link>
        <button
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) reset();
          }}
          className="text-xs text-[var(--muted)] underline transition hover:text-[var(--danger)]"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
