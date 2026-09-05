export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Step = { text: string; code?: string; lang?: string };

export type Block =
  | { type: "prose"; text: string }
  | { type: "points"; items: string[] }
  | { type: "steps"; steps: Step[] }
  | { type: "code"; lang?: string; code: string; caption?: string }
  | { type: "callout"; variant: "info" | "tip" | "warn"; text: string };

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
