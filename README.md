# 1Claw Academy

An interactive, beginner-to-advanced teaching application for **[1Claw](https://1claw.xyz)** — HSM-backed secret management for AI agents and humans.

Built on the pedagogy of Matt Pocock's [`/teach` skill](https://www.aihero.dev/learn-anything-with-my-teach-skill): every lesson is a step-by-step walkthrough that takes you from zero to a working result, followed by an instant-feedback quiz. Progress persists so you can resume where you left off.

## What's inside

**7 tracks · 31 lessons · 93 quiz questions**, all grounded in the real 1Claw docs, example apps, and package READMEs (`docs.1claw.xyz`, `llms.txt`, `github.com/1clawAI`):

1. **Foundations** (Beginner): what 1Claw is, vaults/secrets/envelope encryption, humans vs agents, installing the CLI, your first vault and secret.
2. **Working with Secrets** (Intermediate): the CLI in CI/CD, the TypeScript SDK, versioning and rotation, environment bundles.
3. **Agents & Access Control** (Intermediate): agents as principals, scoped policies, self-enrollment and approvals, MCP.
4. **Advanced Security** (Advanced): the key hierarchy and HSM, CMEK, MPC custody, Shroud TEE, the risk engine.
5. **Transactions & Treasury** (Advanced): the Intents API, treasury multisig, x402 micropayments, embedded wallets.
6. **Compliance & Operations** (Advanced): tamper-evident audit, fleet management, the multi-tenant Platform API.
7. **Integrations & Ecosystem** (Intermediate): the Python SDK, MCP client setup, LangChain, CrewAI, elizaOS, AgentKit on Base.

Each lesson has numbered steps with real `curl` / CLI / SDK / MCP snippets, plus a graded quiz with per-question explanations. The interface follows the official [1Claw brand kit](https://1claw.xyz/brand-kit): signature red, matte black, the dual-claw mark, and the Bakbak One wordmark.

## Tech

- **Next.js 16** (App Router, Turbopack) — lessons are statically generated
- **Tailwind CSS 4**
- Progress tracking via `localStorage` (no backend, no account required)

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build (prerenders all 24 lessons)
```

## Editing the curriculum

Lessons live as JSON in `lib/content/track-<id>.json`, one file per track. Track order, titles, icons, and accent colors live in `lib/content/meta.ts`. Types are in `lib/types.ts`; the curriculum is assembled and indexed in `lib/curriculum.ts`.

Each lesson is `{ id, title, summary, blocks[], quiz[] }`. A `block` is one of `prose`, `steps`, `code`, `callout`, or `points`. To add a lesson, append an object to the right track file. Routing, static params, navigation, progress, and the index all update automatically.

The JSON was generated from the source docs and then run through `scripts/build-content.js`, which decodes HTML entities and asserts no em or en dashes slipped in. Re-run it with `node scripts/build-content.js` if you regenerate the raw inputs under `scripts/raw/`.

---

_Unofficial educational project. For the real product, see [1claw.xyz](https://1claw.xyz) and [docs.1claw.xyz](https://docs.1claw.xyz)._
