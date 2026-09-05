export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Step = { text: string; code?: string; lang?: string };

/** The three capabilities of the lethal trifecta. */
export type Circle = "private-data" | "untrusted-content" | "external-comms";

/** One capability an agent has been granted, for a trifecta audit. */
export type AuditTool = {
  name: string;
  description: string;
  /** Which circles this capability actually contributes. Empty is valid. */
  circles: Circle[];
  /** Why, revealed after the learner commits to an answer. */
  rationale: string;
};

export type Block =
  | { type: "prose"; text: string }
  | { type: "points"; items: string[] }
  | { type: "steps"; steps: Step[] }
  | { type: "code"; lang?: string; code: string; caption?: string }
  | { type: "callout"; variant: "info" | "tip" | "warn"; text: string }
  | {
      type: "audit";
      scenario: string;
      tools: AuditTool[];
      /** Shown once the audit is checked. */
      verdict: string;
    };

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

/** A pointer from a 1Claw lesson back to the concept it builds on. */
export type ConceptLink = {
  trackId: string;
  lessonId: string;
  /** Why this concept matters here, in a few words. */
  note: string;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  blocks: Block[];
  quiz: QuizQuestion[];
  /** Concept lessons this one assumes. Rendered above the body. */
  concepts?: ConceptLink[];
};

export type Track = {
  id: string;
  title: string;
  tagline: string;
  outcome: string;
  level: Level;
  icon: string; // emoji
  accent: string; // css color var name
  lessons: Lesson[];
};

export type LessonRef = {
  trackId: string;
  trackTitle: string;
  level: Level;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  index: number; // global order
};
