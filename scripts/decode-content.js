// Decodes HTML entities that subagents sometimes emit inside JSON strings,
// then rewrites each track-*.json pretty-printed. Safe to run repeatedly.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "lib", "content");

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

let total = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.startsWith("track-") || !file.endsWith(".json")) continue;
  const p = path.join(dir, file);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
  const out = walk(parsed);
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + "\n");
  const n = Array.isArray(out) ? out.length : 0;
  total += n;
  console.log(`${file}: ${n} lessons`);
}
console.log(`total: ${total} lessons`);
