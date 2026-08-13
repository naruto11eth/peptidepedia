import type { EvidenceTier } from "@/lib/schema";

/**
 * How full a vial is drawn, per tier. This is the site's whole argument
 * rendered as a quantity: an approved compound's vial is nearly full, a
 * preclinical one holds a trace. The glass is identical across all of them
 * because the container is not what differs, the contents are.
 */
export const FILL_BY_TIER: Record<EvidenceTier, number> = {
  approved: 0.9,
  trials: 0.6,
  preclinical: 0.25,
  anecdotal: 0.08,
};

/*
 * Proportions are taken from a real 2 mL crimp-top vial: body roughly twice as
 * tall as it is wide, short neck, aluminium crimp with a flip-off centre. An
 * earlier draft used a 3:1 body and read as a spirits bottle, which quietly
 * broke the whole metaphor.
 */
const BODY_X = 6;
const BODY_W = 36;
const BODY_TOP = 30;
const BODY_BOTTOM = 102;
const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;

export function Vial({
  id,
  level,
  className,
  style,
}: {
  /** Must be unique per page: SVG gradient ids are global. */
  id: string;
  level: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const clamped = Math.max(0, Math.min(1, level));
  const fillHeight = BODY_HEIGHT * clamped;
  const fillY = BODY_BOTTOM - fillHeight;

  return (
    <svg viewBox="0 0 48 108" className={className} style={style} role="presentation" aria-hidden>
      <defs>
        {/* Empty glass stays near-transparent so the vial reads as glass with
            nothing in it, rather than as dark liquid. */}
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-amber-deep)" stopOpacity="0.16" />
          <stop offset="20%" stopColor="var(--color-amber-lit)" stopOpacity="0.07" />
          <stop offset="52%" stopColor="var(--color-amber)" stopOpacity="0.04" />
          <stop offset="84%" stopColor="var(--color-amber-deep)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-amber-deep)" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient id={`${id}-contents`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-amber-deep)" />
          <stop offset="26%" stopColor="var(--color-amber-lit)" />
          <stop offset="58%" stopColor="var(--color-amber)" />
          <stop offset="100%" stopColor="var(--color-amber-deep)" />
        </linearGradient>

        <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4e5866" />
          <stop offset="26%" stopColor="#ccd4de" />
          <stop offset="52%" stopColor="#93a0b0" />
          <stop offset="78%" stopColor="#b6c0cc" />
          <stop offset="100%" stopColor="#404955" />
        </linearGradient>

        <clipPath id={`${id}-inner`}>
          <rect
            x={BODY_X + 2}
            y={BODY_TOP}
            width={BODY_W - 4}
            height={BODY_HEIGHT}
            rx="2"
          />
        </clipPath>
      </defs>

      {/* Aluminium crimp cap */}
      <rect x="14" y="4" width="20" height="12" rx="1.5" fill={`url(#${id}-cap)`} />
      {/* Flip-off centre: the detail that makes it read pharmaceutical */}
      <ellipse cx="24" cy="5.4" rx="6.5" ry="1.9" fill="var(--color-amber-deep)" opacity="0.85" />
      <ellipse cx="24" cy="5" rx="6.5" ry="1.9" fill="var(--color-amber)" />
      <rect x="14" y="12.5" width="20" height="0.9" fill="#000" opacity="0.25" />

      {/* Neck and shoulder */}
      <path
        d={`M17 16 h14 v6 l${(BODY_W - 14) / 2} 8 v2 H${BODY_X} v-2 l${(BODY_W - 14) / 2} -8 z`}
        transform="translate(-3.5 0)"
        fill={`url(#${id}-glass)`}
        stroke="var(--color-amber-deep)"
        strokeOpacity="0.35"
        strokeWidth="0.6"
      />

      {/* Body */}
      <rect
        x={BODY_X}
        y={BODY_TOP - 2}
        width={BODY_W}
        height={BODY_HEIGHT + 4}
        rx="3.5"
        fill={`url(#${id}-glass)`}
        stroke="var(--color-amber-deep)"
        strokeOpacity="0.42"
        strokeWidth="0.7"
      />

      {/* Contents. Scales from the base so the load sequence reads as filling. */}
      <g clipPath={`url(#${id}-inner)`}>
        <rect
          x={BODY_X + 2}
          y={fillY}
          width={BODY_W - 4}
          height={fillHeight}
          fill={`url(#${id}-contents)`}
          className="vial-fill"
        />
        {clamped > 0.02 && (
          <ellipse
            cx="24"
            cy={fillY}
            rx={(BODY_W - 4) / 2}
            ry="1.5"
            fill="var(--color-amber-lit)"
            opacity="0.55"
          />
        )}
      </g>

      {/* Specular highlights: the stripes that make glass read as glass. */}
      <rect x="10.5" y="34" width="3" height={BODY_HEIGHT - 14} rx="1.5" fill="#fff" opacity="0.18" />
      <rect x="36" y="40" width="1.6" height={BODY_HEIGHT - 26} rx="0.8" fill="#fff" opacity="0.08" />
      {/* Base ellipse, so the vial sits on the shelf rather than floating */}
      <ellipse cx="24" cy={BODY_BOTTOM} rx={BODY_W / 2 - 2} ry="1.6" fill="#000" opacity="0.3" />
    </svg>
  );
}
