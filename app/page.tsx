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
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signature)]" />
            Interactive course · {totalLessons} lessons · {totalQuestions} quiz
            questions
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Learn <span className="brand-gradient-text">AI security</span>, from
            first principles to production
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Start with the cryptography and access-control concepts everything
            rests on. Then the agent threat model — prompt injection, the lethal
            trifecta, OWASP ASI01–10. Then build the defences for real with{" "}
            <span className="brand-wordmark">1Claw</span>. Every lesson is a
            hands-on walkthrough that ends with an instant-feedback quiz.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/learn/${flatLessons[0].trackId}/${flatLessons[0].lessonId}`}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white shadow-lg shadow-[var(--signature)]/20 transition hover:bg-[var(--signature)]"
            >
              Start from the beginning →
            </Link>
            <ResumeButton />
            <Link
              href="/learn"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-6 py-3 font-medium transition hover:border-[var(--signature)]/50"
            >
              Browse curriculum
            </Link>
          </div>

          {/* What the course covers — mirrors the capability strip on 1claw.co */}
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
            {[
              "Prompt injection",
              "The lethal trifecta",
              "OWASP ASI01–10",
              "Envelope encryption",
              "HSM & TEE",
              "MPC key splitting",
              "Zero secrets in context",
            ].map((f, i) => (
              <li key={f} className="flex items-center gap-3">
                {i > 0 ? (
                  <span aria-hidden className="text-[var(--signature)]">
                    ✦
                  </span>
                ) : null}
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="mb-6">
          <span className="eyebrow" data-index="01">
            How it works
          </span>
          <h2 className="section-title mt-3">Learn by doing.</h2>
          <p className="section-sub mt-2">
            Read a walkthrough, run the commands, then prove it with a quiz.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "target" as IconName,
              title: "Concepts before products",
              body: "Two full tracks on cryptography, access control, and the agent threat model come first — no vendor required. You learn why before how.",
            },
            {
              icon: "flask" as IconName,
              title: "Grounded in real frameworks",
              body: "OWASP ASI01–10, the OWASP LLM Top 10, and the lethal trifecta — cited, not paraphrased, then mapped to controls you can actually deploy.",
            },
            {
              icon: "trend" as IconName,
              title: "Learn by doing",
              body: "Every step is a runnable command verified against the live API, then a graded quiz. Progress saves locally so you can resume anywhere.",
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
        <span className="eyebrow" data-index="02">
          The curriculum
        </span>
        <h2 className="section-title mt-3">The learning path.</h2>
        <p className="section-sub mt-2">
          {tracks.length} tracks · {totalLessons} lessons · beginner to advanced
        </p>
        <ol className="mt-8 space-y-3">
          {tracks.map((t, i) => (
            <li key={t.id}>
              <Link
                href={`/learn/${t.id}/${t.lessons[0].id}`}
                className="card group flex items-center gap-4 p-5 transition hover:border-[var(--signature)]/50"
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
