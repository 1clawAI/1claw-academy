#!/usr/bin/env node
/**
 * Verifies the course content against the things it makes claims about.
 *
 * Three tiers, so this stays useful offline and in CI:
 *
 *   1. Structural — always runs. Schema, quiz sanity, concept cross-links,
 *      house style. No network, no external checkout.
 *   2. API        — runs when the OpenAPI spec is reachable. Every /v1/ path
 *      referenced in a lesson must exist in the live spec.
 *   3. Source     — runs when a 1claw checkout is present (ONECLAW_SRC, or
 *      ~/1claw). CLI signatures, SDK methods, MCP tool names, env vars.
 *
 * Tiers that cannot run are reported as skipped, never as passing.
 *
 *   node scripts/verify-content.mjs [--strict]
 *
 * --strict turns warnings (house style) into failures.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "lib/content");
const STRICT = process.argv.includes("--strict");
const SRC =
  process.env.ONECLAW_SRC ??
  (existsSync(join(homedir(), "1claw")) ? join(homedir(), "1claw") : null);
const SPEC_URL =
  process.env.ONECLAW_SPEC_URL ?? "https://api.1claw.co/openapi.json";

const errors = [];
const warnings = [];
const skipped = [];
const answerPos = [0, 0, 0, 0];
const fail = (lesson, msg) => errors.push({ lesson, msg });
const warn = (lesson, msg) => warnings.push({ lesson, msg });

// ── load ────────────────────────────────────────────────────────────────────
const files = readdirSync(CONTENT).filter(
  (f) => f.startsWith("track-") && f.endsWith(".json"),
);
const tracks = new Map();
for (const f of files) {
  const id = basename(f).slice("track-".length, -".json".length);
  tracks.set(id, JSON.parse(readFileSync(join(CONTENT, f), "utf8")));
}
const lessons = [...tracks.entries()].flatMap(([t, ls]) =>
  ls.map((l) => ({ ...l, trackId: t })),
);
const lessonKeys = new Set(lessons.map((l) => `${l.trackId}/${l.id}`));
const ref = (l) => `${l.trackId}/${l.id}`;

/** All text in a lesson, with JSON escapes resolved. */
const textOf = (l) => JSON.stringify(l).replace(/\\n/g, "\n");

/**
 * Only the runnable code in a lesson. Prose mentions a command the way an
 * English sentence does ("1claw login opens your browser"), so validating
 * invocations against prose produces nothing but false failures.
 */
const codeOf = (l) => {
  const out = [];
  for (const b of l.blocks ?? []) {
    if (b.type === "code" && b.code) out.push(b.code);
    else if (b.type === "steps")
      for (const st of b.steps ?? []) if (st.code) out.push(st.code);
  }
  return out.join("\n");
};

// ── tier 1: structural ──────────────────────────────────────────────────────
const BLOCK_TYPES = new Set([
  "prose",
  "points",
  "steps",
  "code",
  "callout",
  "audit",
  "scenario",
]);
const CIRCLES = new Set([
  "private-data",
  "untrusted-content",
  "external-comms",
]);
const CALLOUT_VARIANTS = new Set(["info", "tip", "warn"]);

for (const l of lessons) {
  for (const k of ["id", "title", "summary", "blocks", "quiz"]) {
    if (!(k in l)) fail(ref(l), `missing required field "${k}"`);
  }
  for (const b of l.blocks ?? []) {
    if (!BLOCK_TYPES.has(b.type)) fail(ref(l), `unknown block type "${b.type}"`);
    if (b.type === "callout" && !CALLOUT_VARIANTS.has(b.variant))
      fail(ref(l), `bad callout variant "${b.variant}"`);
    if (b.type === "steps" && !b.steps?.length)
      fail(ref(l), "steps block has no steps");
    if (b.type === "steps")
      for (const st of b.steps ?? []) {
        if (!st.text?.trim()) fail(ref(l), "step has no text");
        // An empty string renders an empty code box; omit the key instead.
        if ("code" in st && !st.code?.trim())
          fail(ref(l), `step has an empty code block: "${st.text?.slice(0, 40)}"`);
      }
    if (b.type === "code" && !b.code?.trim())
      fail(ref(l), "empty code block");
    if (b.type === "scenario") {
      if (!b.situation?.trim() || !b.question?.trim())
        fail(ref(l), "scenario block missing situation or question");
      const opts = b.options ?? [];
      if (opts.length < 3)
        fail(ref(l), `scenario has ${opts.length} options, expected at least 3`);
      const right = opts.filter((o) => o.correct).length;
      if (right !== 1)
        fail(ref(l), `scenario has ${right} correct options, expected exactly 1`);
      for (const o of opts)
        if (!o.feedback?.trim())
          fail(ref(l), `scenario option "${o.text?.slice(0, 30)}" has no feedback`);
    }
    if (b.type === "audit") {
      if (!b.tools?.length) fail(ref(l), "audit block has no tools");
      if (!b.verdict?.trim()) fail(ref(l), "audit block has no verdict");
      for (const t of b.tools ?? []) {
        if (!t.name || !t.description || !t.rationale)
          fail(ref(l), `audit tool "${t.name ?? "?"}" is missing a field`);
        for (const c of t.circles ?? [])
          if (!CIRCLES.has(c))
            fail(ref(l), `audit tool "${t.name}" has unknown circle "${c}"`);
        if (new Set(t.circles ?? []).size !== (t.circles ?? []).length)
          fail(ref(l), `audit tool "${t.name}" repeats a circle`);
      }
    }
  }
  for (const q of l.quiz ?? []) {
    if (!q.options?.length) fail(ref(l), `quiz question has no options`);
    else if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
      fail(ref(l), `correctIndex ${q.correctIndex} out of range`);
    if (new Set(q.options).size !== q.options.length)
      fail(ref(l), `duplicate quiz options: "${q.question.slice(0, 40)}…"`);
    if (!q.explanation?.trim())
      fail(ref(l), `quiz question has no explanation`);
    if (q.correctIndex >= 0 && q.correctIndex < 4) answerPos[q.correctIndex]++;
  }
  // Concept cross-links must resolve.
  for (const c of l.concepts ?? []) {
    if (!lessonKeys.has(`${c.trackId}/${c.lessonId}`))
      fail(ref(l), `concept link to missing lesson ${c.trackId}/${c.lessonId}`);
    if (`${c.trackId}/${c.lessonId}` === ref(l))
      fail(ref(l), "concept link points at itself");
  }
  // House style: the original content deliberately avoided em/en dashes.
  const dashes = (textOf(l).match(/[—–]/g) ?? []).length;
  if (dashes > 0) warn(ref(l), `${dashes} em/en dash(es) — house style avoids them`);
  // Stale domain.
  if (/1claw\.xyz/.test(textOf(l))) fail(ref(l), "stale 1claw.xyz domain");
}

/*
 * Answer-position balance. With the correct answer nearly always first, a
 * learner who guesses A or B scores in the nineties without reading anything,
 * so the quiz stops measuring comprehension. Any position above 35% means the
 * set has drifted back toward that.
 */
{
  const totalQ = answerPos.reduce((a, b) => a + b, 0);
  if (totalQ >= 40) {
    answerPos.forEach((n, i) => {
      const pct = Math.round((100 * n) / totalQ);
      if (pct > 35)
        fail(
          "quiz",
          `answer position ${String.fromCharCode(65 + i)} holds ${pct}% of correct answers (max 35%)`,
        );
    });
  }
}

/*
 * Applied-assessment coverage. Recall questions show that a lesson was read;
 * an Advanced lesson should also ask for a decision. Every lesson in a track
 * marked Advanced needs at least one scenario or audit block.
 */
{
  const meta = readFileSync(join(ROOT, "lib/content/meta.ts"), "utf8");
  const advanced = new Set();
  for (const m of meta.matchAll(
    /id:\s*"([a-z-]+)"[\s\S]{0,400}?level:\s*"(\w+)"/g,
  ))
    if (m[2] === "Advanced") advanced.add(m[1]);
  for (const l of lessons) {
    if (!advanced.has(l.trackId)) continue;
    const hasApplied = (l.blocks ?? []).some(
      (b) => b.type === "scenario" || b.type === "audit",
    );
    if (!hasApplied)
      fail(ref(l), "Advanced lesson has no applied exercise (scenario or audit)");
  }
}

// Duplicate ids across the course would break routing.
const seen = new Set();
for (const l of lessons) {
  if (seen.has(ref(l))) fail(ref(l), "duplicate lesson id within track");
  seen.add(ref(l));
}

// ── tier 2: API paths against the live OpenAPI spec ─────────────────────────
const norm = (p) =>
  p
    .replace(/\$[A-Z_]+/g, "{id}")
    .replace(/\{[^}]*\}/g, "{id}")
    .replace(/\/$/, "");
// Paths that are deliberately not the 1Claw Vault API.
const FOREIGN = [
  /^\/v1\/chat\/completions$/, // Shroud
  /^\/v1\/(balance|charges|data|transfers|shipments)$/, // third-party examples (Stripe, carrier APIs)
  /^\/v1\/oauth$/, // prose reference to a group of endpoints
];

async function checkApi() {
  let spec;
  try {
    const res = await fetch(SPEC_URL, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    spec = await res.json();
  } catch (e) {
    skipped.push(`API paths — could not fetch ${SPEC_URL} (${e.message})`);
    return;
  }
  const specPaths = new Set(Object.keys(spec.paths ?? {}).map(norm));
  // literal chain / environment names stand in for path params
  const relax = (p) =>
    [p].concat(
      ["ethereum", "solana", "bitcoin", "base", "preview", "production"].map(
        (lit) => p.replaceAll("/" + lit, "/{id}"),
      ),
    );
  for (const l of lessons) {
    const t = textOf(l);
    for (const m of t.matchAll(/\/v1\/[A-Za-z0-9/_.{}$-]+/g)) {
      const raw = norm(m[0].replace(/[",'.\\]+$/, ""));
      if (FOREIGN.some((re) => re.test(raw))) continue;
      // Secret paths are user-supplied and sit below several vault endpoints.
      if (
        /^\/v1\/vaults\/\{id\}\/(secrets|secret-rotate|secret-version|secret-version-disable|secret-versions)\//.test(
          raw,
        )
      )
        continue;
      if (relax(raw).some((c) => specPaths.has(c))) continue;
      fail(ref(l), `API path not in OpenAPI spec: ${raw}`);
    }
  }
}

// ── tier 3: CLI / SDK / MCP against the 1claw source ────────────────────────
function readIf(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function checkSource() {
  if (!SRC || !existsSync(SRC)) {
    skipped.push(
      "CLI/SDK/MCP — no 1claw checkout (set ONECLAW_SRC or clone to ~/1claw)",
    );
    return;
  }

  // --- CLI signatures -------------------------------------------------------
  // Subcommands must be valid *for their group*, so a per-group map is required:
  // a global one would accept `secret put` just because `memory put` exists.
  // Groups can also be assembled across files -- binding.ts exports
  // registerAgentBindingCommands(agentCommand), which hangs `binding` off the
  // agent group -- so the owning group is taken from that parameter name when
  // present, and from the filename otherwise.
  const cmdDir = join(SRC, "packages/cli/src/commands");
  const groups = new Map(); // top-level name -> Map(sub -> min positional arity)
  const topLevel = new Set();
  if (existsSync(cmdDir)) {
    for (const f of readdirSync(cmdDir).filter((f) => f.endsWith(".ts"))) {
      const src = readFileSync(join(cmdDir, f), "utf8");
      // Which group do this file's subcommands belong to?
      const reg = src.match(
        /export function register\w+Commands\(\s*(\w+)\s*:\s*Command/,
      );
      const owner = reg
        ? reg[1].replace(/Command$/, "").toLowerCase()
        : f.slice(0, -3);
      topLevel.add(f.slice(0, -3));
      const subs = groups.get(owner) ?? new Map();
      for (const m of src.matchAll(
        /(?:\.command|new Command)\(\s*["'`]([a-z][a-z0-9:_-]*)((?:\s+[<[][^>\]]*[>\]])*)["'`]/g,
      )) {
        const args = [...m[2].matchAll(/<[^>]+>/g)].length;
        // Min arity: names repeat across nested groups, and under-reporting a
        // requirement is safer in CI than a false failure.
        subs.set(m[1], Math.min(subs.get(m[1]) ?? Infinity, args));
      }
      groups.set(owner, subs);
      // A group's own name may differ from its filename (sub-org.ts -> sub-org).
      for (const m of src.matchAll(
        /export const \w+Command = new Command\(\s*["'`]([a-z][a-z0-9-]*)/g,
      ))
        topLevel.add(m[1]);
      // Commands defined beside another (whoami lives in login.ts).
      for (const m of src.matchAll(
        /new Command\(\s*["'`]([a-z][a-z0-9-]*)["'`]\)/g,
      ))
        topLevel.add(m[1]);
    }
    const index = readIf(join(SRC, "packages/cli/src/index.ts")) ?? "";
    for (const m of index.matchAll(/new Command\(\s*["'`]([a-z][a-z0-9-]*)/g))
      topLevel.add(m[1]);
  } else {
    skipped.push("CLI -- packages/cli not found in checkout");
  }

  if (topLevel.size) {
    for (const l of lessons) {
      // Every occurrence, not one per line, and code only.
      for (const m of codeOf(l).matchAll(
        /^\s*1claw\s+([a-z][a-z0-9-]*)([^\n|&;]*)/gm,
      )) {
        const top = m[1];
        if (!topLevel.has(top)) {
          fail(ref(l), `unknown CLI command: 1claw ${top}`);
          continue;
        }
        const subs = groups.get(top);
        if (!subs?.size) continue; // group has no subcommands to check against
        const toks = m[2].trim().split(/\s+/).filter(Boolean);
        if (!toks.length || toks[0].startsWith("-")) continue;
        if (!/^[a-z][a-z0-9-]*$/.test(toks[0])) continue;
        if (!subs.has(toks[0])) {
          fail(ref(l), `unknown CLI subcommand: 1claw ${top} ${toks[0]}`);
          continue;
        }
        // Walk further bare words that also name subcommands of this group,
        // so `agent binding test` resolves to the `test` leaf.
        let i = 0;
        let leaf = toks[0];
        while (
          i + 1 < toks.length &&
          /^[a-z][a-z0-9-]*$/.test(toks[i + 1]) &&
          subs.has(toks[i + 1])
        ) {
          i++;
          leaf = toks[i];
        }
        let positional = 0;
        for (let j = i + 1; j < toks.length; j++) {
          const t = toks[j];
          if (t.startsWith("#")) break; // trailing comment
          if (t.startsWith("--")) {
            if (!t.includes("=")) j++; // consume its value
            continue;
          }
          if (t.startsWith("-")) continue;
          positional++;
        }
        const need = subs.get(leaf);
        if (positional < need)
          fail(
            ref(l),
            `1claw ${top} ${leaf} needs ${need} positional arg(s), example gives ${positional}`,
          );
      }
    }
  }

  // --- SDK resources and methods -------------------------------------------
  const clientSrc = readIf(join(SRC, "packages/sdk/src/core/client.ts"));
  const resDir = join(SRC, "packages/sdk/src/resources");
  if (clientSrc && existsSync(resDir)) {
    const prop = new Map();
    for (const m of clientSrc.matchAll(
      /readonly ([a-zA-Z0-9]+):\s*([A-Za-z]+)/g,
    ))
      prop.set(m[1], m[2]);
    const methods = new Map();
    for (const f of readdirSync(resDir).filter((f) => f.endsWith(".ts"))) {
      const src = readFileSync(join(resDir, f), "utf8");
      for (const c of src.matchAll(/export class ([A-Za-z]+)/g)) {
        const set = methods.get(c[1]) ?? new Set();
        for (const mm of src.matchAll(
          /^\s{4}(?:async\s+)?([a-zA-Z0-9_]+)\s*[<(]/gm,
        ))
          set.add(mm[1]);
        methods.set(c[1], set);
      }
    }
    for (const l of lessons) {
      // The Python SDK has its own naming (client.vaults, snake_case).
      if (l.id === "python-sdk") continue;
      for (const m of textOf(l).matchAll(
        /client\.([a-zA-Z0-9]+)\.([a-zA-Z0-9_]+)\s*\(/g,
      )) {
        const cls = prop.get(m[1]);
        if (!cls) {
          fail(ref(l), `client.${m[1]} is not a resource on OneclawClient`);
          continue;
        }
        const set = methods.get(cls);
        if (set && !set.has(m[2]))
          fail(ref(l), `client.${m[1]}.${m[2]}() not found on ${cls}`);
      }
    }
  } else {
    skipped.push("SDK — packages/sdk not found in checkout");
  }

  // --- MCP tool names -------------------------------------------------------
  const mcpDir = join(SRC, "packages/mcp/src/tools");
  const mcpIndex = readIf(join(SRC, "packages/mcp/src/index.ts"));
  if (existsSync(mcpDir)) {
    const tools = new Set(
      readdirSync(mcpDir)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.slice(0, -3)),
    );
    for (const src of [mcpIndex ?? ""].concat(
      readdirSync(mcpDir)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => readFileSync(join(mcpDir, f), "utf8")),
    ))
      for (const m of src.matchAll(/name:\s*["'`]([a-z0-9_]+)["'`]/g))
        tools.add(m[1]);
    // Only check names the lesson explicitly frames as an MCP tool.
    for (const l of lessons) {
      for (const m of textOf(l).matchAll(/MCP tool:?\s+`([a-z][a-z0-9_]+)`/gi))
        if (!tools.has(m[1]))
          fail(ref(l), `MCP tool "${m[1]}" not found in packages/mcp`);
    }
  } else {
    skipped.push("MCP — packages/mcp not found in checkout");
  }

  // --- env var names --------------------------------------------------------
  const envUsed = new Set();
  for (const l of lessons)
    for (const m of textOf(l).matchAll(/\bONECLAW_[A-Z0-9_]+/g))
      envUsed.add(m[0]);
  // Quiz distractors are meant to be wrong; only check vars in code blocks.
  const inCode = new Set();
  for (const l of lessons)
    for (const b of l.blocks ?? []) {
      const bodies =
        b.type === "code"
          ? [b.code]
          : b.type === "steps"
            ? b.steps.map((s) => s.code ?? "")
            : [];
      for (const c of bodies)
        for (const m of c.matchAll(/\bONECLAW_[A-Z0-9_]+/g)) inCode.add(m[0]);
    }
  const grepTargets = ["packages", "skill", "docs"]
    .map((d) => join(SRC, d))
    .filter(existsSync);
  if (grepTargets.length) {
    // Read once: a shallow scan of package sources for env var mentions.
    const haystack = [];
    const walk = (dir, depth = 0) => {
      if (depth > 6) return;
      let ents;
      try {
        ents = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of ents) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, depth + 1);
        else if (/\.(ts|tsx|js|py|md|rs|sh|json|yaml|yml)$/.test(e.name)) {
          const s = readIf(p);
          if (s) haystack.push(s);
        }
      }
    };
    for (const d of grepTargets) walk(d);
    const blob = haystack.join("\n");
    for (const v of inCode)
      if (!blob.includes(v))
        warn(
          "env",
          `${v} appears in a code example but not in the 1claw source`,
        );
  }
}

// ── run ─────────────────────────────────────────────────────────────────────
await checkApi();
checkSource();

const pad = (s) => s.padEnd(46);
console.log(
  `\nVerified ${lessons.length} lessons across ${tracks.size} tracks\n`,
);
if (errors.length) {
  console.log(`✗ ${errors.length} error(s):`);
  for (const e of errors) console.log(`  ${pad(e.lesson)} ${e.msg}`);
  console.log();
}
if (warnings.length) {
  const byMsg = warnings.filter((w) => /em\/en dash/.test(w.msg));
  const other = warnings.filter((w) => !/em\/en dash/.test(w.msg));
  if (byMsg.length)
    console.log(
      `! house style: ${byMsg.length} lesson(s) use em/en dashes (${byMsg.reduce(
        (n, w) => n + Number(w.msg.match(/^(\d+)/)?.[1] ?? 0),
        0,
      )} total)`,
    );
  for (const w of other) console.log(`  ! ${pad(w.lesson)} ${w.msg}`);
  console.log();
}
if (skipped.length) {
  console.log("skipped (not verified, not passing):");
  for (const s of skipped) console.log(`  - ${s}`);
  console.log();
}
if (!errors.length && !warnings.length) console.log("✓ all checks passed\n");
else if (!errors.length) console.log("✓ no errors\n");

const failed = errors.length > 0 || (STRICT && warnings.length > 0);
process.exit(failed ? 1 : 0);
