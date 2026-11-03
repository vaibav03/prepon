import type { Rule } from "@/lib/types";

/** A rule must fix this share of the complaints it is replayed against. */
export const MIN_FIX_RATE = 0.7;
/** And it must have been replayed against at least this many of them. */
export const MIN_COMPLAINTS = 10;
/** The live set is capped. A new rule has to displace an old one. */
export const LIVE_CAP = 60;

export interface GateCondition {
  id: string;
  requirement: string;
  reading: string;
  met: boolean;
}

export interface GateReport {
  fixRate: number;
  conditions: GateCondition[];
  met: boolean;
  /** The first unmet condition, said as something the rule still needs. */
  shortfall: string | null;
}

export function evaluateGate(rule: Rule, liveCount: number): GateReport {
  const { complaints, fixed } = rule.evidence;
  const fixRate = complaints > 0 ? fixed / complaints : 0;

  const rateMet = fixRate >= MIN_FIX_RATE;
  const sampleMet = complaints >= MIN_COMPLAINTS;
  const slotMet = liveCount < LIVE_CAP;

  const conditions: GateCondition[] = [
    {
      id: "rate",
      requirement: "Fixes at least 70% of the complaints it was replayed against",
      reading: `${Math.round(fixRate * 100)}% — ${fixed} of ${complaints}`,
      met: rateMet,
    },
    {
      id: "sample",
      requirement: "Replayed against at least 10 past complaints",
      reading: sampleMet
        ? `${complaints} complaints`
        : `${complaints} complaints — ${MIN_COMPLAINTS - complaints} short`,
      met: sampleMet,
    },
    {
      id: "slot",
      requirement: "A free slot in the live set",
      reading: `${liveCount} of ${LIVE_CAP} in use`,
      met: slotMet,
    },
  ];

  let shortfall: string | null = null;
  if (!rateMet) {
    const needed = Math.ceil(MIN_FIX_RATE * complaints) - fixed;
    shortfall = `It would need to fix ${needed} more of those ${complaints} complaints.`;
  } else if (!sampleMet) {
    const needed = MIN_COMPLAINTS - complaints;
    shortfall = `It needs ${needed} more past ${
      needed === 1 ? "complaint" : "complaints"
    } to replay against.`;
  } else if (!slotMet) {
    shortfall = "The live set is full. Retire a rule to make room.";
  }

  return {
    fixRate,
    conditions,
    met: rateMet && sampleMet && slotMet,
    shortfall,
  };
}
