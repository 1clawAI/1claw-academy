"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  code,
  lang,
  caption,
}: {
  code: string;
  lang?: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <figure className="my-5">
      <div className="card overflow-hidden !rounded-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
            {lang || "code"}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            {copied ? (
              <>
                <Check size={12} /> Copied
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">
          <code className="font-mono text-[#d5d8e6]">{code}</code>
        </pre>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-[var(--muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
