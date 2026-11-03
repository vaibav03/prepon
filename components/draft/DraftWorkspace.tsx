"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import { drafts, getRule } from "@/lib/fixtures";
import type { Draft, EditPair, Rule } from "@/lib/types";
import { buildPlan } from "./stream";
import { clipPhrase, synthesizeRule } from "./ruleFromEdit";
import DraftBody from "./DraftBody";
import type { CursorState } from "./DraftBody";
import PromptBar from "./PromptBar";
import AppliedRail from "./AppliedRail";
import EditGhost from "./EditGhost";
import type { GhostSpec } from "./EditGhost";
import RuleBirthFlight from "./RuleBirthFlight";
import type { FlightSpec } from "./RuleBirthFlight";

const TOKENS_PER_TICK = 2;
const TICK_MS = 36;
const EDIT_SETTLE_MS = 700;

interface Capture {
  spanId: string;
  paragraph: number;
  before: string;
  after: string;
  rule: Rule;
  at: number;
}

/**
 * Find the card in the rail that a new rule should fly to. Both the sidebar
 * and the bottom sheet render a card per rule, so take the first one that is
 * actually on screen; when the sheet is shut, land on the sheet's own bar.
 */
function findRailSlot(root: HTMLElement | null, ruleId: string): HTMLElement | null {
  if (!root) return null;
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(`[data-rail-slot="${ruleId}"]`),
  );
  for (const el of candidates) {
    if (el.closest('[data-rail-hidden="true"]')) continue;
    if (el.getBoundingClientRect().width > 1) return el;
  }
  for (const el of Array.from(
    root.querySelectorAll<HTMLElement>("[data-rail-fallback]"),
  )) {
    if (el.getBoundingClientRect().width > 1) return el;
  }
  return null;
}

export function DraftWorkspace() {
  const reduce = useReducedMotion() ?? false;

  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [stage, setStage] = useState<"idle" | "streaming" | "ready">("idle");
  const [revealed, setRevealed] = useState(0);
  const [cursor, setCursor] = useState<CursorState>("none");

  const [captures, setCaptures] = useState<Record<string, Capture>>({});
  const [rewritten, setRewritten] = useState<ReadonlySet<string>>(new Set());
  const [flash, setFlash] = useState<{ spanId: string; phase: "on" | "off" } | null>(
    null,
  );
  const [ghost, setGhost] = useState<GhostSpec | null>(null);
  const [flight, setFlight] = useState<FlightSpec | null>(null);
  const [arrivingRuleId, setArrivingRuleId] = useState<string | null>(null);
  const [pendingBirth, setPendingBirth] = useState<{
    key: string;
    spanId: string;
    ruleId: string;
    phrase: string;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Bumped on every request so asking for the same draft twice gives a clean
  // surface rather than reusing the DOM the writer already edited.
  const [session, setSession] = useState(0);

  const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const spanEls = useRef(new Map<string, HTMLElement>());
  const capturesRef = useRef<Record<string, Capture>>({});
  const settleTimers = useRef(new Map<number, number>());
  const nextDraftIndex = useRef(0);
  const cursorTimer = useRef<number | null>(null);
  const measuredBirth = useRef<string | null>(null);

  const plan = useMemo(() => (draft ? buildPlan(draft) : null), [draft]);
  const streaming = stage === "streaming";
  // Reduced motion never streams, so the draft is simply already here.
  const revealedNow = plan ? (streaming ? revealed : plan.total) : 0;

  const appliedRules = useMemo<Rule[]>(() => {
    if (!draft) return [];
    return draft.appliedRuleIds
      .map((id) => getRule(id))
      .filter((rule): rule is Rule => Boolean(rule));
  }, [draft]);

  const bornRules = useMemo<Rule[]>(
    () =>
      Object.values(captures)
        .sort((a, b) => b.at - a.at)
        .map((capture) => capture.rule),
    [captures],
  );

  const markedParagraphs = useMemo(
    () => new Set(Object.values(captures).map((capture) => capture.paragraph)),
    [captures],
  );

  const arrivingRuleIds = useMemo(
    () => new Set(arrivingRuleId ? [arrivingRuleId] : []),
    [arrivingRuleId],
  );

  const activeRuleId = hoveredRuleId ?? selectedRuleId;

  // A rule born from an edit has no ruleId on any span, so its sweep targets
  // the span the writer actually rewrote.
  const sweepSpanIds = useMemo(() => {
    const ids = new Set<string>();
    if (!activeRuleId) return ids;
    for (const capture of Object.values(captures)) {
      if (capture.rule.id === activeRuleId) ids.add(capture.spanId);
    }
    return ids;
  }, [activeRuleId, captures]);

  const registerSpan = useCallback((id: string, el: HTMLElement | null) => {
    if (el) spanEls.current.set(id, el);
    else spanEls.current.delete(id);
  }, []);

  /* --- streaming ---------------------------------------------------- */

  /** The draft has fully arrived: stop the clock and settle the cursor. */
  const finishStream = useCallback(
    (total: number) => {
      setRevealed(total);
      setStage("ready");
      setCursor(reduce ? "none" : "fading");
      if (reduce) return;
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
      cursorTimer.current = window.setTimeout(() => setCursor("none"), 520);
    },
    [reduce],
  );

  useEffect(() => {
    if (!streaming || !plan || reduce) return;
    let at = 0;
    const id = window.setInterval(() => {
      at = Math.min(plan.total, at + TOKENS_PER_TICK);
      if (at >= plan.total) {
        window.clearInterval(id);
        finishStream(plan.total);
        return;
      }
      setRevealed(at);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [streaming, plan, reduce, finishStream]);

  // Any click or keypress brings the whole draft in at once.
  useEffect(() => {
    if (!streaming || !plan) return;
    const snap = () => finishStream(plan.total);
    window.addEventListener("pointerdown", snap);
    window.addEventListener("keydown", snap);
    return () => {
      window.removeEventListener("pointerdown", snap);
      window.removeEventListener("keydown", snap);
    };
  }, [streaming, plan, finishStream]);

  useEffect(
    () => () => {
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
    },
    [],
  );

  /* --- capture ------------------------------------------------------ */

  const writeCaptures = useCallback((next: Record<string, Capture>) => {
    capturesRef.current = next;
    setCaptures(next);
  }, []);

  const captureEdit = useCallback(
    (
      spanId: string,
      paragraph: number,
      before: string,
      after: string,
      el: HTMLElement,
    ) => {
      if (!draft) return;
      const rect = el.getBoundingClientRect();
      const pair: EditPair = {
        id: `e-${draft.id}-${spanId}-${Date.now()}`,
        before: before.trim(),
        after: after.trim(),
        context: `${draft.title} · rewritten in place`,
        capturedAt: new Date().toISOString(),
      };
      const rule = synthesizeRule(pair, `r-draft-${draft.id}-${spanId}`);
      const capture: Capture = {
        spanId,
        paragraph,
        before: pair.before,
        after: pair.after,
        rule,
        at: Date.now(),
      };

      writeCaptures({ ...capturesRef.current, [spanId]: capture });
      setRewritten((prev) => {
        const next = new Set(prev);
        next.add(spanId);
        return next;
      });
      setFlash({ spanId, phase: "on" });
      setAnnouncement(`Edit recorded. Proposed rule: ${rule.text}`);

      if (reduce) {
        setArrivingRuleId(null);
        setPendingBirth(null);
        setGhost(null);
        return;
      }

      setGhost({
        id: pair.id,
        text: pair.before,
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
      setArrivingRuleId(rule.id);
      setPendingBirth({
        key: pair.id,
        spanId,
        ruleId: rule.id,
        phrase: clipPhrase(pair.after, 16),
      });
    },
    [draft, reduce, writeCaptures],
  );

  const commitParagraph = useCallback(
    (paragraph: number) => {
      if (!plan) return;
      const spans = plan.paragraphs[paragraph];
      if (!spans) return;
      for (const span of spans) {
        const el = spanEls.current.get(span.id);
        if (!el) continue;
        const after = (el.textContent ?? "").replace(/ /g, " ");
        if (after.trim().length < 2) continue;
        if (after.trim() === span.text.trim()) continue;
        const previous = capturesRef.current[span.id];
        if (previous && previous.after === after.trim()) continue;
        captureEdit(span.id, paragraph, span.text, after, el);
        // One rule at a time. The rail is not a feed.
        break;
      }
    },
    [plan, captureEdit],
  );

  const handleParagraphInput = useCallback(
    (paragraph: number) => {
      const existing = settleTimers.current.get(paragraph);
      if (existing) window.clearTimeout(existing);
      const id = window.setTimeout(() => {
        settleTimers.current.delete(paragraph);
        commitParagraph(paragraph);
      }, EDIT_SETTLE_MS);
      settleTimers.current.set(paragraph, id);
    },
    [commitParagraph],
  );

  const handleParagraphBlur = useCallback(
    (paragraph: number) => {
      const existing = settleTimers.current.get(paragraph);
      if (existing) {
        window.clearTimeout(existing);
        settleTimers.current.delete(paragraph);
      }
      commitParagraph(paragraph);
    },
    [commitParagraph],
  );

  useEffect(() => {
    const timers = settleTimers.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  /* --- the three one-shot animations -------------------------------- */

  useEffect(() => {
    if (!flash) return;
    if (flash.phase === "on") {
      const frame = requestAnimationFrame(() =>
        setFlash({ spanId: flash.spanId, phase: "off" }),
      );
      return () => cancelAnimationFrame(frame);
    }
    const id = window.setTimeout(() => setFlash(null), 440);
    return () => window.clearTimeout(id);
  }, [flash]);

  useEffect(() => {
    if (!ghost) return;
    const id = window.setTimeout(() => setGhost(null), 340);
    return () => window.clearTimeout(id);
  }, [ghost]);

  // A real FLIP: the card has to exist before either rect can be read, so the
  // measurement runs after commit and before paint. This is the one place a
  // layout effect legitimately sets state.
  useLayoutEffect(() => {
    if (!pendingBirth || measuredBirth.current === pendingBirth.key) return;
    measuredBirth.current = pendingBirth.key;

    const fromEl = spanEls.current.get(pendingBirth.spanId);
    const toEl = findRailSlot(rootRef.current, pendingBirth.ruleId);
    const from = fromEl?.getBoundingClientRect();
    const to = toEl?.getBoundingClientRect();

    const next: FlightSpec | null =
      from && to && from.width > 1 && to.width > 1
        ? {
            id: pendingBirth.key,
            phrase: pendingBirth.phrase,
            from: { top: from.top, left: from.left, width: from.width },
            to: {
              top: to.top + 24,
              left: to.left + 12,
              width: Math.max(96, to.width - 24),
            },
          }
        : null;

    setFlight(next);
    if (!next) setArrivingRuleId(null);
  }, [pendingBirth]);

  useEffect(() => {
    if (!flight) return;
    const reveal = window.setTimeout(() => setArrivingRuleId(null), 215);
    const clear = window.setTimeout(() => setFlight(null), 370);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(clear);
    };
  }, [flight]);

  /* --- prompt ------------------------------------------------------- */

  const startDraft = useCallback(
    (text: string, draftId?: string) => {
      const index = draftId
        ? Math.max(0, drafts.findIndex((item) => item.id === draftId))
        : nextDraftIndex.current % drafts.length;
      nextDraftIndex.current = index + 1;

      setSession((value) => value + 1);
      setPrompt(text);
      setDraft(drafts[index]);
      setStage(reduce ? "ready" : "streaming");
      setRevealed(0);
      setCursor(reduce ? "none" : "live");
      writeCaptures({});
      setRewritten(new Set());
      setFlash(null);
      setGhost(null);
      setFlight(null);
      setArrivingRuleId(null);
      setPendingBirth(null);
      setHoveredRuleId(null);
      setSelectedRuleId(null);
      setAnnouncement("");
      spanEls.current.clear();
    },
    [reduce, writeCaptures],
  );

  const handleSelect = useCallback((ruleId: string) => {
    setSelectedRuleId((current) => (current === ruleId ? null : ruleId));
  }, []);

  /* --- render ------------------------------------------------------- */

  return (
    <div ref={rootRef} className="flex min-h-dvh">
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[54rem] pt-8 pr-4 pb-28 pl-10 md:pt-10 md:pr-8 md:pl-16 lg:pb-16">
          <PromptBar
            value={prompt}
            onValueChange={setPrompt}
            streaming={streaming}
            onSubmit={() => startDraft(prompt.trim())}
          />

          {draft && plan ? (
            <article className="mt-8">
              <h1 className="mb-6 max-w-measure font-serif text-title leading-[1.25] text-primary md:text-headline">
                {draft.title}
              </h1>
              <DraftBody
                key={`${draft.id}-${session}`}
                plan={plan}
                revealed={revealedNow}
                streaming={streaming}
                cursor={cursor}
                reduce={reduce}
                rewritten={rewritten}
                markedParagraphs={markedParagraphs}
                flash={flash}
                sweepRuleId={activeRuleId}
                sweepSpanIds={sweepSpanIds}
                registerSpan={registerSpan}
                onParagraphInput={handleParagraphInput}
                onParagraphBlur={handleParagraphBlur}
              />
              {stage === "ready" ? (
                <p className="mt-10 max-w-measure border-t border-hairline pt-3 text-ui leading-[1.6] text-faint">
                  Rewrite any line by hand. Prepon keeps the pair and proposes a
                  rule; nothing it proposes is used until replay clears it.
                </p>
              ) : null}
            </article>
          ) : (
            <EmptyState onPick={(text, id) => startDraft(text, id)} />
          )}
        </div>
      </div>

      <AppliedRail
        applied={appliedRules}
        born={bornRules}
        arrivingRuleIds={arrivingRuleIds}
        activeRuleId={activeRuleId}
        selectedRuleId={selectedRuleId}
        reduce={reduce}
        onHover={setHoveredRuleId}
        onSelect={handleSelect}
      />

      {ghost ? <EditGhost ghost={ghost} reduce={reduce} /> : null}
      {flight ? <RuleBirthFlight flight={flight} /> : null}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

function EmptyState({
  onPick,
}: {
  onPick: (prompt: string, draftId: string) => void;
}) {
  return (
    <div className="mt-10 max-w-measure">
      <p className="prepon-label mb-3">Or pick up something you asked for before</p>
      <ul className="flex flex-col border-y border-hairline">
        {drafts.map((item, index) => (
          <li key={item.id} className={index > 0 ? "border-t border-hairline" : ""}>
            <button
              type="button"
              onClick={() => onPick(item.prompt, item.id)}
              className="w-full py-3 text-left font-serif text-prose leading-[1.6] text-secondary transition-colors duration-150 ease-out hover:text-primary"
            >
              {item.prompt}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-7 text-ui leading-[1.65] text-faint">
        Prepon writes with the rules that are live right now, and shows you which
        ones touched which sentence. Rewrite a line by hand and it reads the
        pair, writes the rule back in plain English, and holds it until replay
        says it would have fixed what you complained about before.
      </p>
    </div>
  );
}

export default DraftWorkspace;
