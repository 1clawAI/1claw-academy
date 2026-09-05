import type { Block } from "./types";

/** Prose at ~200wpm, plus 12s per code block to skim or run it. */
export function readingMinutes(blocks: Block[]): number {
  let words = 0;
  let code = 0;
  for (const b of blocks) {
    if (b.type === "prose" || b.type === "callout")
      words += b.text.split(/\s+/).length;
    else if (b.type === "points") words += b.items.join(" ").split(/\s+/).length;
    else if (b.type === "steps") {
      for (const s of b.steps) {
        words += s.text.split(/\s+/).length;
        if (s.code) code += 1;
      }
    } else if (b.type === "code") code += 1;
  }
  return Math.max(2, Math.round(words / 200 + (code * 12) / 60));
}
