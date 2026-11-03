"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  /* White pill, near-black label. No shadow — the reference has none. */
  primary:
    "bg-button-white text-button-ink border border-transparent hover:brightness-105",
  /* Card-coloured pill with a hairline. */
  secondary:
    "bg-card text-primary border border-hairline hover:border-hairline-strong",
  /* No chrome until hover. For tertiary actions sitting next to a pill. */
  ghost:
    "bg-transparent text-secondary border border-transparent hover:text-primary hover:bg-card",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-ui",
  md: "h-10 px-5 text-ui",
  lg: "h-12 px-6 text-ui-lg",
};

const BASE = [
  "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  "rounded-full font-sans font-medium",
  "select-none cursor-pointer",
  // Feedback lands on press, not release. Colour eases, scale snaps.
  "transition-[background-color,border-color,color,transform] duration-150 ease-out",
  "active:scale-[0.97] active:duration-100",
  "disabled:pointer-events-none disabled:opacity-45",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "motion-reduce:active:scale-100 motion-reduce:transition-none",
].join(" ");

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a next/link anchor instead of a button. */
  href?: string;
  /** Stretch to the width of the parent. */
  block?: boolean;
  className?: string;
}

/**
 * The only button on the marketing site. Full pill, two real variants.
 * Press feedback is CSS `:active`, so it fires on pointer-down with no
 * JavaScript round trip, and is disabled under prefers-reduced-motion.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  block = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = clsx(BASE, VARIANT[variant], SIZE[size], block && "w-full", className);

  if (href) {
    const external = /^https?:|^mailto:|^#/.test(href);
    if (external) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

export default Button;
