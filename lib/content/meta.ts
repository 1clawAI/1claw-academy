import type { Level } from "../types";
import type { IconName } from "@/components/Icon";

export type TrackMeta = {
  id: string;
  title: string;
  tagline: string;
  /** What the reader can actually do once the track is finished. */
  outcome: string;
  level: Level;
  icon: IconName;
  accent: string;
};

// Order here is the order of the course. Lessons are attached from the
// per-track JSON files in curriculum.ts.
export const trackMeta: TrackMeta[] = [
  {
    id: "security-foundations",
    title: "Security Foundations",
    tagline:
      "The cryptography and access-control ideas everything else rests on. No 1Claw yet.",
    outcome:
      "explain envelope encryption, hardware roots of trust, policy models, and threshold cryptography — and say why each one exists.",
    level: "Beginner",
    icon: "security-foundations",
    accent: "#9aa7b5",
  },
  {
    id: "agent-threat-model",
    title: "The AI Agent Threat Model",
    tagline:
      "What actually breaks when an LLM can act: injection, the lethal trifecta, and OWASP ASI01-10.",
    outcome:
      "audit any agent design against the lethal trifecta and OWASP ASI01–10, and name the control that answers each risk.",
    level: "Beginner",
    icon: "agent-threat-model",
    accent: "#ff5a5c",
  },
  {
    id: "foundations",
    title: "Foundations",
    tagline: "Get the core ideas, install the CLI, and store your first secret.",
    outcome:
      "create a vault, store and read a secret, and connect an AI client to it over MCP.",
    level: "Beginner",
    icon: "foundations",
    accent: "#df171a",
  },
  {
    id: "working-with-secrets",
    title: "Working with Secrets",
    tagline: "Wire secrets into CI, apps, and the SDK, then rotate them safely.",
    outcome:
      "wire secrets into CI and applications, scope them per environment, and rotate them without downtime.",
    level: "Intermediate",
    icon: "working-with-secrets",
    accent: "#ff5a5c",
  },
  {
    id: "agents-access",
    title: "Agents & Access Control",
    tagline: "Give agents an identity, scope them tightly, and connect over MCP.",
    outcome:
      "give an agent a tightly scoped identity and let it call external APIs without ever holding a credential.",
    level: "Intermediate",
    icon: "agents-access",
    accent: "#c4123a",
  },
  {
    id: "advanced-security",
    title: "Advanced Security",
    tagline: "Go deep on the HSM key hierarchy, CMEK, MPC, Shroud, and risk.",
    outcome:
      "configure CMEK, MPC custody, TEE-routed inference, and step-up authentication for treasury operations.",
    level: "Advanced",
    icon: "advanced-security",
    accent: "#990029",
  },
  {
    id: "transactions-treasury",
    title: "Transactions & Treasury",
    tagline: "Sign onchain from agents, run a treasury, and pay with x402.",
    outcome:
      "sign on-chain transactions from an agent under hard guardrails, with humans approving what matters.",
    level: "Advanced",
    icon: "transactions-treasury",
    accent: "#e0a13a",
  },
  {
    id: "compliance-ops",
    title: "Compliance & Operations",
    tagline: "Query the audit log, run agent fleets, and build multi-tenant apps.",
    outcome:
      "answer who-did-what from the audit log, run a fleet of agents, and operate 1Claw for many tenants.",
    level: "Advanced",
    icon: "compliance-ops",
    accent: "#9aa7b5",
  },
  {
    id: "ecosystem",
    title: "Integrations & Ecosystem",
    tagline: "Plug 1Claw into Python, MCP clients, and your agent framework.",
    outcome:
      "plug 1Claw into Python, LangChain, CrewAI, elizaOS, and containerized agent runtimes.",
    level: "Intermediate",
    icon: "ecosystem",
    accent: "#7b86c4",
  },
];
