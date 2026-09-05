import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="eyebrow" data-index="404">
        Not found
      </p>
      <h1 className="section-title mt-4">That page does not exist.</h1>
      <p className="section-sub mt-3">
        The lesson may have been renamed. Press{" "}
        <kbd className="rounded border border-[var(--border)] px-1 font-mono text-xs">
          ⌘K
        </kbd>{" "}
        to search, or browse the curriculum.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/learn"
          className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--signature)]"
        >
          Browse curriculum
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--signature)]/50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
