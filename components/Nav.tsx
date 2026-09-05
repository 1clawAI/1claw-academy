"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { Logo } from "./Logo";
import { Search } from "lucide-react";

export function Nav() {
  const { percent, ready, completedCount } = useProgress();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-lg">
            <span className="brand-wordmark">1Claw</span>{" "}
            <span className="font-normal text-[var(--muted)]">Academy</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <button
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              )
            }
            aria-label="Search lessons"
            className="mr-1 flex items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--muted)] transition hover:border-[var(--signature)]/50 hover:text-[var(--foreground)]"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden font-mono text-[10px] opacity-70 sm:inline">
              ⌘K
            </kbd>
          </button>
          <Link
            href="/learn"
            className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            Curriculum
          </Link>
          <a
            href="https://docs.1claw.co"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            Docs ↗
          </a>
          <a
            href="https://1claw.co/for-ai"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)] sm:block"
          >
            For AI ↗
          </a>
          {ready && completedCount > 0 ? (
            <div className="ml-2 hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--signature-soft)] to-[var(--signature)] transition-all"
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
