import type { SVGProps } from "react";

/**
 * Geometric 16px glyphs drawn to the same grid. No emoji, no icon font.
 * Every one takes its colour from the surrounding type.
 */

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 16 16",
  width: 14,
  height: 14,
  "aria-hidden": "true",
  focusable: "false",
};

export function PinGlyph({ filled = false }: { filled?: boolean }) {
  return (
    <svg {...base}>
      <path
        d="M4.25 2.5h7.5v11l-3.75-2.9-3.75 2.9z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrossGlyph() {
  return (
    <svg {...base}>
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronGlyph() {
  return (
    <svg {...base}>
      <path
        d="M6 3l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckGlyph() {
  return (
    <svg {...base}>
      <path
        d="M3 8.5l3.25 3.25L13 4.75"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
