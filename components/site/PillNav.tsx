"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useReducedMotion } from "motion/react";

import ThemeToggle from "@/components/ui/ThemeToggle";

export interface PillNavLink {
  /** Visible label. */
  label: string;
  /** In-page anchor, e.g. "#how". This is a one-page site — never /app/*. */
  href: string;
}

export interface PillNavProps {
  /** Quiet anchor links to sections on this same page. One or two. */
  links?: PillNavLink[];
  /** Label on the white pill. */
  ctaLabel?: string;
  /** Anchor the white pill scrolls to. */
  ctaHref?: string;
  /** Hide the theme control, e.g. on a page that is single-theme. */
  showThemeToggle?: boolean;
  className?: string;
}

const DEFAULT_LINKS: PillNavLink[] = [
  { label: "Demo", href: "#demo" },
  { label: "How it holds up", href: "#honest" },
];

/** Smooth in-page scroll that respects prefers-reduced-motion. */
function useAnchorScroll(reduced: boolean) {
  return (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    // Keep the hash so the link is still shareable / focusable.
    window.history.replaceState(null, "", href);
  };
}

/**
 * The site's only navigation: a centred floating pill fixed ~24px from the
 * top, blurred backdrop, hairline border, --surface-blur.
 *
 * Two things keep it from tangling with the page chrome passing underneath —
 * the product frames have top bars of their own, and two stacked bars read as
 * a rendering bug:
 *
 *   1. It sits in its own layer well above the page (z-70), over a scroll
 *      edge: a blurred, masked strip (z-60) that dissolves whatever scrolls
 *      under it instead of letting it collide with the pill. The strip is
 *      colour-agnostic — it blurs what is behind rather than painting a band
 *      — so it works over both the plain and the raised sections.
 *   2. It recedes once scrolling starts: it tucks up, shrinks and drops to
 *      90% opacity, then returns to full strength on hover or focus. The
 *      whole move is transform + opacity, so nothing re-lays out on scroll.
 */
export function PillNav({
  links = DEFAULT_LINKS,
  ctaLabel = "Watch the demo",
  ctaHref = "#demo",
  showThemeToggle = true,
  className,
}: PillNavProps) {
  const reduced = useReducedMotion() ?? false;
  const [scrolled, setScrolled] = useState(false);
  const onAnchor = useAnchorScroll(reduced);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll edge. Content dissolves as it reaches the nav rather than
          sliding under it edge-to-edge. Fades in only once there is
          something to pass underneath. */}
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none fixed inset-x-0 top-0 z-[60] h-24 sm:h-28",
          // Blur dissolves the type passing under; the faint page-coloured
          // wash keeps a bright heading from reading as a grey smear. The
          // mask ramps both away before the strip ends, so there is no edge.
          "bg-surface/40 backdrop-blur-[14px]",
          "[mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]",
          "transition-opacity duration-300 ease-out",
          "motion-reduce:transition-none",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={clsx(
          "pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center",
          "px-4 pt-4 sm:pt-6",
          className,
        )}
      >
        <nav
          aria-label="Primary"
          className={clsx(
            "group pointer-events-auto flex w-full max-w-[640px] items-center gap-2",
            "rounded-full border backdrop-blur-xl backdrop-saturate-150",
            "shadow-[var(--nav-shadow)]",
            // Transform and opacity only: the pill shrinks and tucks up on
            // the compositor, never by animating its own height or padding.
            "h-13 origin-top pr-1.5 pl-5",
            "transition-[transform,opacity,background-color,border-color] duration-200 ease-out",
            "motion-reduce:transition-none",
            scrolled
              ? [
                  "scale-[0.93] -translate-y-0.5 opacity-90",
                  "border-hairline-strong bg-blur-strong",
                  // Reaching for it brings it back to full strength.
                  "hover:opacity-100 focus-within:opacity-100",
                ]
              : "translate-y-0 scale-100 border-hairline bg-blur opacity-100",
          )}
        >
          {/* Wordmark, centred-left. */}
          <a
            href="#top"
            onClick={(e) => onAnchor(e, "#top")}
            className="prepon-display mr-auto text-[1.0625rem] leading-none tracking-[-0.01em] text-primary"
          >
            Prepon
          </a>

          {/* Quiet in-page anchors. Hidden on phones. */}
          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => onAnchor(e, link.href)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-ui text-secondary",
                  "transition-colors duration-150 ease-out",
                  "hover:bg-white/[0.06] hover:text-primary",
                  "motion-reduce:transition-none",
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Theme. Compact pill, left of the CTA; dropped where the nav
              goes compact. */}
          {showThemeToggle ? (
            <ThemeToggle className="mr-0.5 hidden shrink-0 sm:inline-grid" />
          ) : null}

          {/* White pill. Scrolls to the scripted demo. */}
          <a
            href={ctaHref}
            onClick={(e) => onAnchor(e, ctaHref)}
            className={clsx(
              "inline-flex shrink-0 items-center justify-center rounded-full",
              "bg-button-white text-button-ink",
              "font-sans font-medium whitespace-nowrap",
              "transition-[filter,transform] duration-150 ease-out",
              "hover:brightness-105 active:scale-[0.97] active:duration-100",
              "motion-reduce:transition-none motion-reduce:active:scale-100",
              "h-10 px-4.5 text-ui",
            )}
          >
            {ctaLabel}
          </a>
        </nav>
      </div>
    </>
  );
}

export default PillNav;
