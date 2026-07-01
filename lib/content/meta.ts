import type { Level } from "../types";
import type { IconName } from "@/components/Icon";

export type TrackMeta = {
  id: string;
  title: string;
  tagline: string;
  level: Level;
  icon: IconName;
  accent: string;
};

// Order here is the order of the course. Lessons are attached from the
// per-track JSON files in curriculum.ts.
export const trackMeta: TrackMeta[] = [
  {
    id: "foundations",
    title: "Foundations",
    tagline: "Get the core ideas, install the CLI, and store your first secret.",
    level: "Beginner",
    icon: "foundations",
    accent: "#df171a",
  },
  {
    id: "working-with-secrets",
    title: "Working with Secrets",
    tagline: "Wire secrets into CI, apps, and the SDK, then rotate them safely.",
    level: "Intermediate",
    icon: "working-with-secrets",
    accent: "#ff5a5c",
  },
  {
    id: "agents-access",
    title: "Agents & Access Control",
    tagline: "Give agents an identity, scope them tightly, and connect over MCP.",
    level: "Intermediate",
    icon: "agents-access",
    accent: "#c4123a",
  },
  {
    id: "advanced-security",
    title: "Advanced Security",
    tagline: "Go deep on the HSM key hierarchy, CMEK, MPC, Shroud, and risk.",
    level: "Advanced",
    icon: "advanced-security",
    accent: "#990029",
  },
  {
    id: "transactions-treasury",
    title: "Transactions & Treasury",
    tagline: "Sign onchain from agents, run a treasury, and pay with x402.",
    level: "Advanced",
    icon: "transactions-treasury",
    accent: "#e0a13a",
  },
  {
    id: "compliance-ops",
    title: "Compliance & Operations",
    tagline: "Query the audit log, run agent fleets, and build multi-tenant apps.",
    level: "Advanced",
    icon: "compliance-ops",
    accent: "#9aa7b5",
  },
  {
    id: "ecosystem",
    title: "Integrations & Ecosystem",
    tagline: "Plug 1Claw into Python, MCP clients, and your agent framework.",
    level: "Intermediate",
    icon: "ecosystem",
    accent: "#7b86c4",
  },
];
