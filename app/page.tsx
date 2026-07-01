import Link from "next/link";
import {
  tracks,
  totalLessons,
  totalQuestions,
  flatLessons,
} from "@/lib/curriculum";
import { ResumeButton } from "@/components/ResumeButton";
import { Icon, type IconName } from "@/components/Icon";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-1.5 text-xs text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            Interactive course · {totalLessons} lessons · {totalQuestions} quiz
            questions
          </div>
          <h1 className="brand-wordmark mx-auto max-w-4xl text-4xl tracking-tight sm:text-6xl">
            Master <span className="brand-gradient-text">1Claw</span>, from your
            first vault to TEE-signed transactions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            1Claw is HSM-backed secret management built for AI agents and humans.
            This hands-on course takes you from the core ideas to advanced
            security, on-chain signing, and multi-tenant platforms. Every step
            is a hands-on walkthrough that ends with an instant-feedback quiz.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/learn/${flatLessons[0].trackId}/${flatLessons[0].lessonId}`}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white shadow-lg shadow-[var(--primary)]/20 transition hover:bg-[var(--primary-2)]"
            >
              Start from the beginning →
            </Link>
            <ResumeButton />
            <Link
              href="/learn"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-6 py-3 font-medium transition hover:border-[var(--primary)]/50"
            >
              Browse curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "target" as IconName,
              title: "Beginner to advanced",
              body: "Seven tracks build on each other: foundations, secrets, agents, security, on-chain, operations, and integrations.",
            },
            {
              icon: "flask" as IconName,
              title: "Learn by doing",
              body: "Every lesson is a step-by-step walkthrough from zero to a working result, then a graded quiz.",
            },
            {
              icon: "trend" as IconName,
              title: "Progress that sticks",
              body: "Your completion and scores are saved locally so you can resume exactly where you left off.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--primary-2)]">
                <Icon name={f.icon} size={18} />
              </div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Track overview */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-2xl font-bold tracking-tight">The learning path</h2>
        <p className="mt-2 text-[var(--muted)]">
          {tracks.length} tracks · {totalLessons} lessons
        </p>
        <ol className="mt-8 space-y-3">
          {tracks.map((t, i) => (
            <li key={t.id}>
              <Link
                href={`/learn/${t.id}/${t.lessons[0].id}`}
                className="card group flex items-center gap-4 p-5 transition hover:border-[var(--primary)]/50"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${t.accent} 14%, transparent)`,
                    color: t.accent,
                  }}
                >
                  <Icon name={t.icon as IconName} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold">{t.title}</h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{
                        color: t.accent,
                        background: `color-mix(in srgb, ${t.accent} 12%, transparent)`,
                      }}
                    >
                      {t.level}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--muted)]">
                    {t.tagline}
                  </p>
                </div>
                <span className="hidden shrink-0 text-sm text-[var(--muted)] sm:block">
                  {t.lessons.length} lessons
                </span>
                <span className="text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary-2)]">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
