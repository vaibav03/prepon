import type { CorpusSource } from "@/lib/types";

/** What the writer gave Prepon to read before it proposed its first rule. */
export const corpus: CorpusSource[] = [
  {
    id: "c-linkedin-archive",
    label: "LinkedIn posts, Jan 2024 – Sept 2026",
    kind: "paste",
    words: 41200,
    addedAt: "2026-09-02T10:04:00.000Z",
  },
  {
    id: "c-thursday-note",
    label: "The Thursday Note — 64 issues",
    kind: "link",
    words: 88400,
    addedAt: "2026-09-02T10:19:00.000Z",
  },
  {
    id: "c-client-email",
    label: "Client email, sent folder (Maren, Dani, Northbeam)",
    kind: "upload",
    words: 23750,
    addedAt: "2026-09-05T16:48:00.000Z",
  },
  {
    id: "c-voice-notes",
    label: "Voice-note transcripts, Sept 2026",
    kind: "upload",
    words: 6130,
    addedAt: "2026-10-07T09:31:00.000Z",
  },
];

export default corpus;
