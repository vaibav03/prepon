export type RuleStatus = "live" | "proposed" | "expiring" | "retired";

export type RuleKind =
  | "avoid_word"
  | "sentence_habit"
  | "structure"
  | "stance"
  | "length";

export interface EditPair {
  id: string;
  before: string;
  after: string;
  context: string;
  capturedAt: string;
}

export interface ReplayEvidence {
  complaints: number;
  fixed: number;
  sampled: string[];
}

export interface Rule {
  id: string;
  text: string;
  kind: RuleKind;
  status: RuleStatus;
  createdAt: string;
  applied: number;
  kept: number;
  reverted: number;
  health: number;
  pinned: boolean;
  evidence: ReplayEvidence;
  sourceEdits: EditPair[];
}

export interface DraftSpan {
  text: string;
  ruleId?: string;
  origin: "ai" | "user";
}

export interface Draft {
  id: string;
  title: string;
  prompt: string;
  paragraphs: DraftSpan[][];
  appliedRuleIds: string[];
  createdAt: string;
}

export interface WinRatePoint {
  edits: number;
  winRate: number;
}

export interface ComparePair {
  id: string;
  prompt: string;
  a: string[];
  b: string[];
  prepon: "a" | "b";
}

export interface CorpusSource {
  id: string;
  label: string;
  kind: "paste" | "upload" | "link";
  words: number;
  addedAt: string;
}
