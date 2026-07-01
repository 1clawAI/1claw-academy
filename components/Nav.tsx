"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { Logo } from "./Logo";

export function Nav() {
  const { percent, ready, completedCount } = useProgress();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="brand-wordmark text-lg">
            1Claw{" "}
            <span className="text-[var(--muted)] font-normal">Academy</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link
            href="/learn"
            className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            Curriculum
          </Link>
          <a
            href="https://docs.1claw.xyz"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            Docs ↗
          </a>
          {ready && completedCount > 0 ? (
            <div className="ml-2 hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary-2)] to-[var(--primary)] transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="font-mono text-xs text-[var(--muted)]">
                {percent}%
              </span>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
