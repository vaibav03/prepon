"use client";

import clsx from "clsx";
import { useCallback, useSyncExternalStore } from "react";
import type { ReactElement } from "react";

export type ThemeChoice = "light" | "dark" | "system";

/** Must match the key read by the pre-paint script in app/layout.tsx. */
const STORAGE_KEY = "prepon-theme";

/* ---------------------------------------------------------------------------
   Store.

   The stored choice lives in localStorage, which is external state, so it is
   read through useSyncExternalStore rather than copied into component state
   inside an effect. That keeps the component free of setState-in-effect and
   lets React hydrate with the server snapshot ("system") before swapping to
   the real value on the client.
   --------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", emit);
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) window.removeEventListener("storage", emit);
  };
}

function getSnapshot(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private mode, blocked storage: fall back to following the OS.
    return "system";
  }
}

/** The server cannot know the choice, so it always renders "system". */
function getServerSnapshot(): ThemeChoice {
  return "system";
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

function writeTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage is unavailable; the choice still applies for this page view.
  }
  applyTheme(choice);
  emit();
}

/* ---------------------------------------------------------------------------
   Icons. Inline, 14px, currentColor — no icon library is installed.
   --------------------------------------------------------------------------- */

const ICON_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 14 14",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Circle plus eight rays. */
function SunIcon() {
  return (
    <svg
      {...ICON_PROPS}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    >
      <circle cx="7" cy="7" r="2.9" />
      <path d="M7 1.1v1.3M7 11.6v1.3M12.9 7h-1.3M2.4 7H1.1M11.17 2.83l-.92.92M3.75 10.25l-.92.92M11.17 11.17l-.92-.92M3.75 3.75l-.92-.92" />
    </svg>
  );
}

/** Crescent. */
function MoonIcon() {
  return (
    <svg
      {...ICON_PROPS}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 1.75a3.5 3.5 0 0 0 5.25 5.25A5.25 5.25 0 1 1 7 1.75Z" />
    </svg>
  );
}

/** Half-filled circle: half light, half dark. */
function SystemIcon() {
  return (
    <svg {...ICON_PROPS} fill="none">
      <circle cx="7" cy="7" r="5.1" stroke="currentColor" strokeWidth={1.2} />
      <path d="M7 1.9a5.1 5.1 0 0 1 0 10.2Z" fill="currentColor" />
    </svg>
  );
}

interface Option {
  value: ThemeChoice;
  /** Both the aria-label and the native tooltip. */
  label: string;
  icon: () => ReactElement;
}

const OPTIONS: Option[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "Match system", icon: SystemIcon },
];

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Three-state theme control: light, dark, match system.
 *
 * A pill of pill buttons, sized to sit beside the nav's CTA. The selection is
 * a single sliding indicator rather than three independent backgrounds, so
 * changing theme reads as one object moving — ease-in-out, 200ms, transform
 * only, and interruptible because it is a transition and not a keyframe.
 *
 * Meaning is carried by symbols; `aria-label` and `title` carry it for
 * screen readers and on hover.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const select = useCallback((next: ThemeChoice) => writeTheme(next), []);

  const index = OPTIONS.findIndex((option) => option.value === choice);
  const activeIndex = index === -1 ? OPTIONS.length - 1 : index;

  return (
    <div
      role="group"
      aria-label="Theme"
      className={clsx(
        "relative isolate inline-grid grid-cols-3 items-center",
        // A shallow well. --surface-sunken and --hairline both invert with
        // the theme, so the control reads the same way in light and dark.
        "rounded-full border border-hairline bg-sunken/45 p-[3px]",
        className,
      )}
    >
      {/* The selection. One element, moved on the compositor. */}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] -z-10",
          "w-[calc((100%-6px)/3)] rounded-full",
          "bg-hairline ring-1 ring-hairline ring-inset",
          "transition-transform duration-200 [transition-timing-function:cubic-bezier(0.77,0,0.175,1)]",
          "motion-reduce:transition-none",
        )}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = option.value === choice;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            className={clsx(
              "inline-flex size-7 items-center justify-center rounded-full",
              "cursor-pointer select-none",
              // Colour eases; the press snaps, on pointer-down.
              "transition-[color,transform] duration-150 ease-out",
              "active:scale-[0.92] active:duration-100",
              "motion-reduce:transition-none motion-reduce:active:scale-100",
              active ? "text-primary" : "text-faint hover:text-secondary",
            )}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
