import type { WinRatePoint } from "@/lib/types";

/**
 * Blind-comparison win rate for Prepon-shaped drafts against plain ones, read
 * against the number of edits the user has contributed. Starts at a coin flip,
 * noisy, crosses 0.6 at about 70 edits, settles near 0.68.
 */
export const winRate: WinRatePoint[] = [
  { edits: 0, winRate: 0.5 },
  { edits: 8, winRate: 0.48 },
  { edits: 17, winRate: 0.53 },
  { edits: 24, winRate: 0.51 },
  { edits: 33, winRate: 0.57 },
  { edits: 41, winRate: 0.55 },
  { edits: 49, winRate: 0.59 },
  { edits: 58, winRate: 0.58 },
  { edits: 66, winRate: 0.62 },
  { edits: 74, winRate: 0.61 },
  { edits: 85, winRate: 0.66 },
  { edits: 97, winRate: 0.64 },
  { edits: 112, winRate: 0.69 },
  { edits: 130, winRate: 0.68 },
];

export default winRate;
