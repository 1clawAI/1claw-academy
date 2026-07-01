import {
  BookOpen,
  KeyRound,
  Bot,
  ShieldCheck,
  Coins,
  ClipboardCheck,
  Blocks,
  Lightbulb,
  CheckCircle2,
  TriangleAlert,
  Target,
  FlaskConical,
  TrendingUp,
  Terminal,
  Check,
  type LucideProps,
} from "lucide-react";

const registry = {
  // Track icons
  foundations: BookOpen,
  "working-with-secrets": KeyRound,
  "agents-access": Bot,
  "advanced-security": ShieldCheck,
  "transactions-treasury": Coins,
  "compliance-ops": ClipboardCheck,
  ecosystem: Blocks,
  // Callout icons
  info: Lightbulb,
  tip: CheckCircle2,
  warn: TriangleAlert,
  // Value props
  target: Target,
  flask: FlaskConical,
  trend: TrendingUp,
  terminal: Terminal,
  check: Check,
} as const;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  ...props
}: { name: IconName } & LucideProps) {
  const Cmp = registry[name] ?? BookOpen;
  return <Cmp {...props} />;
}
