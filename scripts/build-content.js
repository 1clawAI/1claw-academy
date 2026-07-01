// Reads raw subagent outputs (objects of trackId -> lessons[]) from scripts/raw/,
// decodes HTML entities that subagents sometimes emit, and writes one
// pretty-printed lib/content/track-<id>.json per track. Safe to re-run.
const fs = require("fs");
const path = require("path");

const rawDir = path.join(__dirname, "raw");
const outDir = path.join(__dirname, "..", "lib", "content");

function decode(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&"); // must be last
}

function walk(v) {
  if (typeof v === "string") return decode(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const k in v) o[k] = walk(v[k]);
    return o;
  }
  return v;
}

// guard: no raw em/en dashes should survive into content
function assertNoDashes(obj, where) {
  const s = JSON.stringify(obj);
  if (/[—–]/.test(s)) {
    const idx = s.search(/[—–]/);
    throw new Error(`em/en dash found in ${where} near: ${s.slice(idx - 40, idx + 40)}`);
  }
}

let total = 0;
for (const file of fs.readdirSync(rawDir)) {
  if (!file.endsWith(".json")) continue;
  const parsed = JSON.parse(fs.readFileSync(path.join(rawDir, file), "utf8"));
  const decoded = walk(parsed);
  for (const trackId of Object.keys(decoded)) {
    const lessons = decoded[trackId];
    assertNoDashes(lessons, `${file}:${trackId}`);
    fs.writeFileSync(
      path.join(outDir, `track-${trackId}.json`),
      JSON.stringify(lessons, null, 2) + "\n",
    );
    total += lessons.length;
    console.log(`track-${trackId}.json: ${lessons.length} lessons`);
  }
}
console.log(`total: ${total} lessons`);
