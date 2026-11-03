"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComparePair } from "@/lib/types";
import Prose from "@/components/ui/Prose";
import CompareComplete from "./CompareComplete";
import DraftPanel from "./DraftPanel";
import PickBar from "./PickBar";
import { ORDINAL, attributionFor, type Side, type Verdict } from "./side";

const TYPING_TAGS = /^(INPUT|TEXTAREA|SELECT)$/;

export interface CompareSessionProps {
  pairs: ComparePair[];
}

/**
 * Blind A/B over a session of pairs. The order of the two columns is fixed
 * (`a` first, `b` second) and the fixtures alternate which column holds the
 * Prepon draft, so there is no ordering tell to learn.
 */
export function CompareSession({ pairs }: CompareSessionProps) {
  const [index, setIndex] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);

  const complete = index >= pairs.length;
  const pair: ComparePair | undefined = pairs[index];
  const picked: Side | null =
    (pair && verdicts.find((v) => v.pairId === pair.id)?.picked) || null;

  const choose = useCallback(
    (side: Side) => {
      setVerdicts((prev) => {
        const current = pairs[index];
        if (!current || prev.some((v) => v.pairId === current.id)) return prev;
        return [...prev, { pairId: current.id, picked: side }];
      });
    },
    [index, pairs],
  );

  const advance = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, pairs.length));
  }, [pairs.length]);

  const restart = useCallback(() => {
    setVerdicts([]);
    setIndex(0);
  }, []);

  // Left / right to pick, then any of right / enter / space to move on.
  useEffect(() => {
    if (complete) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || TYPING_TAGS.test(target.tagName))
      ) {
        return;
      }

      if (picked === null) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          choose("a");
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          choose("b");
        }
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        advance();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, choose, complete, picked]);

  if (complete || !pair) {
    return (
      <CompareComplete
        pairs={pairs}
        verdicts={verdicts}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-6 md:px-8 md:pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="font-serif text-title text-primary">Blind compare</h1>
          <p className="prepon-label prepon-numeric">
            Pair {index + 1} of {pairs.length}
          </p>
        </div>

        <p className="prepon-label mt-6">The brief both answered</p>
        <Prose as="p" width="wide" className="mt-1.5 text-secondary">
          {pair.prompt}
        </Prose>
      </header>

      <div className="mx-auto w-full max-w-[1480px] flex-1 px-4 md:px-8">
        <div className="grid grid-cols-1 gap-7 min-[900px]:grid-cols-[1fr_1px_1fr] min-[900px]:gap-0">
          <DraftPanel
            pairId={pair.id}
            ordinal={ORDINAL.a}
            paragraphs={pair.a}
            attribution={attributionFor(pair, "a")}
            revealed={picked !== null}
            chosen={picked === "a"}
          />
          <div
            aria-hidden="true"
            className="h-px w-full self-stretch bg-hairline min-[900px]:h-auto min-[900px]:w-px"
          />
          <DraftPanel
            pairId={pair.id}
            ordinal={ORDINAL.b}
            paragraphs={pair.b}
            attribution={attributionFor(pair, "b")}
            revealed={picked !== null}
            chosen={picked === "b"}
          />
        </div>
      </div>

      <PickBar
        pairs={pairs}
        pair={pair}
        verdicts={verdicts}
        picked={picked}
        onPick={choose}
        onAdvance={advance}
        isLast={index === pairs.length - 1}
      />
    </div>
  );
}

export default CompareSession;
