import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

export type PlateTone = "ocean" | "dune" | "coast" | "dusk" | "slate" | "ember";
export type PlateAspect = "4/3" | "3/2" | "16/10" | "16/9" | "square" | "auto";
export type PlatePadding = "none" | "sm" | "md" | "lg";

const ASPECT: Record<PlateAspect, string> = {
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-[16/9]",
  square: "aspect-square",
  auto: "",
};

const PADDING: Record<PlatePadding, string> = {
  none: "",
  sm: "p-4 sm:p-6",
  md: "p-6 sm:p-10",
  lg: "p-8 sm:p-14",
};

/**
 * Light falling across a surface, in four layers:
 *   1. a high soft key light from the upper left
 *   2. a cooler fill bouncing in from the right
 *   3. a deep floor rising from the bottom
 *   4. a wide, very low-contrast directional streak
 * Every stop is drawn from the plate tone tokens, which are desaturated at
 * source. There is deliberately no hue rotation here — if a plate ever reads
 * as colourful, fix the token, not this function.
 */
function surface(tone: PlateTone): CSSProperties {
  const base = `var(--plate-${tone}-base)`;
  const light = `var(--plate-${tone}-light)`;
  const fill = `var(--plate-${tone}-fill)`;
  const deep = `var(--plate-${tone}-deep)`;
  const mix = (c: string, pct: number) =>
    `color-mix(in srgb, ${c} ${pct}%, transparent)`;

  return {
    backgroundColor: base,
    backgroundImage: [
      `radial-gradient(118% 82% at 16% 6%, ${mix(light, 62)} 0%, ${mix(light, 18)} 34%, transparent 58%)`,
      `radial-gradient(82% 66% at 92% 20%, ${mix(fill, 72)} 0%, transparent 56%)`,
      `radial-gradient(150% 108% at 44% 122%, ${mix(deep, 95)} 0%, ${mix(deep, 40)} 44%, transparent 72%)`,
      `linear-gradient(104deg, transparent 18%, ${mix(light, 14)} 42%, transparent 64%)`,
      `linear-gradient(172deg, ${mix(fill, 30)} 0%, transparent 52%)`,
    ].join(", "),
  };
}

export interface PlateProps {
  children?: ReactNode;
  /** Which abstract surface to draw. Vary it between sections. */
  tone?: PlateTone;
  /** Shape of the panel. "auto" lets the children set the height. */
  aspect?: PlateAspect;
  /** Inner padding around the floating children. */
  padding?: PlatePadding;
  /** Centre the children in the panel. Off by default. */
  center?: boolean;
  className?: string;
  /** Classes for the content layer that floats above the surface. */
  contentClassName?: string;
}

/**
 * The photographic plate: a 12px-radius panel of pure CSS standing in for the
 * large photography the reference uses. No image files, no licensing.
 *
 * Children float above it and should bring their own dark card chrome — the
 * plate supplies the depth, the vignette and the grain that make them read.
 */
export function Plate({
  children,
  tone = "ocean",
  aspect = "4/3",
  padding = "md",
  center = false,
  className,
  contentClassName,
}: PlateProps) {
  return (
    <div
      className={clsx(
        "relative isolate w-full overflow-hidden rounded-panel",
        ASPECT[aspect],
        className,
      )}
      style={surface(tone)}
    >
      {/* Grain. Monochrome fractal noise, kept well under the threshold where
          it reads as texture-for-its-own-sake. */}
      <span
        aria-hidden="true"
        className="prepon-grain pointer-events-none absolute inset-0 z-10 opacity-[0.16] mix-blend-overlay"
      />

      {/* Inner vignette, so a dark card has something to sit against. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(118% 92% at 50% 42%, transparent 34%, var(--plate-vignette-mid) 78%, var(--plate-vignette-edge) 100%)",
          boxShadow:
            "var(--plate-inset)",
        }}
      />

      {children ? (
        <div
          className={clsx(
            "relative z-30 flex h-full w-full flex-col",
            center && "items-center justify-center",
            PADDING[padding],
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default Plate;
