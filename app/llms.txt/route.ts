import { tracks, totalLessons, totalQuestions } from "@/lib/curriculum";

export const dynamic = "force-static";

const BASE = "https://academy.1claw.co";

function buildLlmsTxt(): string {
  const labs = tracks.reduce(
    (n, t) => n + t.lessons.filter((l) => l.kind === "lab").length,
    0,
  );
  const capstones = tracks.reduce(
    (n, t) => n + t.lessons.filter((l) => l.kind === "capstone").length,
    0,
  );

  const lines: string[] = [];
  lines.push("# 1Claw Academy");
  lines.push("");
  lines.push(
    "> An interactive, free course on AI security: cryptography and access-control foundations, the AI agent threat model (prompt injection, the lethal trifecta, OWASP ASI01-10), then hands-on defenses built with 1Claw, an HSM-backed secrets and agent-identity platform.",
  );
  lines.push("");
  lines.push(
    `${totalLessons} lessons across ${tracks.length} tracks, beginner to advanced. ${totalQuestions} quiz questions, ${labs} hands-on labs (several run against live 1Claw production infrastructure), ${capstones} capstone projects.`,
  );
  lines.push("");
  lines.push("## Links");
  lines.push("");
  lines.push(`- Curriculum: ${BASE}/learn`);
  lines.push(`- 1Claw product: https://1claw.co`);
  lines.push(`- 1Claw docs: https://docs.1claw.co`);
  lines.push(`- 1Claw llms.txt: https://1claw.co/llms.txt`);
  lines.push(`- 1Claw API: https://api.1claw.co`);
  lines.push("");
  lines.push("## What this course is");
  lines.push("");
  lines.push(
    "Each lesson pairs a short explanation with a hands-on step-by-step walkthrough and an instant-feedback quiz. Concept tracks (Security Foundations, The AI Agent Threat Model) teach the underlying ideas — envelope encryption, HSM roots of trust, RBAC/ABAC, Zero Trust, STRIDE, the lethal trifecta — with no product dependency. Product tracks then build the same ideas as working defenses on 1Claw, covering the full path from a local vault to a multi-tenant SaaS deployment. Progress and achievements are tracked client-side only (localStorage); there is no account system or verified credential.",
  );
  lines.push("");
  lines.push("## Tracks");
  lines.push("");
  for (const t of tracks) {
    const trackLabs = t.lessons.filter((l) => l.kind === "lab").length;
    const trackCaps = t.lessons.filter((l) => l.kind === "capstone").length;
    const extras = [
      trackLabs ? `${trackLabs} lab${trackLabs === 1 ? "" : "s"}` : null,
      trackCaps ? `${trackCaps} capstone${trackCaps === 1 ? "" : "s"}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `- **${t.title}** (${t.level}, ${t.lessons.length} lessons${extras ? `, ${extras}` : ""}): ${t.tagline} By the end you'll be able to ${t.outcome} ${BASE}/learn/${t.id}`,
    );
  }
  lines.push("");
  lines.push("## Full lesson index");
  lines.push("");
  for (const t of tracks) {
    lines.push(`### ${t.title}`);
    for (const l of t.lessons) {
      const tag = l.kind ? ` [${l.kind}]` : "";
      lines.push(`- ${l.title}${tag} — ${BASE}/learn/${t.id}/${l.id}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
