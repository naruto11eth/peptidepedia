import Link from "next/link";

import { FILL_BY_TIER, Vial } from "@/components/vial";
import { EVIDENCE_TIERS, EVIDENCE_TIER_META, type CompoundSummary } from "@/lib/schema";

/**
 * The rack is the hero, the index, and the thesis in one object: every compound
 * in the reference, drawn as a vial whose fill is how much human evidence
 * actually exists. It is a chart that happens to look like a shelf.
 *
 * Sorted strongest to weakest so the drop-off is the first thing you read.
 */
export function EvidenceRack({ compounds }: { compounds: CompoundSummary[] }) {
  const sorted = [...compounds].sort(
    (a, b) =>
      FILL_BY_TIER[b.evidenceTier] - FILL_BY_TIER[a.evidenceTier] ||
      a.name.localeCompare(b.name),
  );

  const bands = EVIDENCE_TIERS.slice()
    .sort((a, b) => EVIDENCE_TIER_META[b].rank - EVIDENCE_TIER_META[a].rank)
    .map((tier) => ({
      tier,
      label: EVIDENCE_TIER_META[tier].short,
      full: EVIDENCE_TIER_META[tier].label,
      color: EVIDENCE_TIER_META[tier].color,
      count: compounds.filter((c) => c.evidenceTier === tier).length,
    }))
    .filter((b) => b.count > 0)
    // A band only one vial wide has no room for its label, and a truncated
    // "ANECD..." is worse than none: the count and coloured rule still carry it.
    .map((b) => ({ ...b, showLabel: b.count / compounds.length >= 0.12 }));

  return (
    <div className="relative">
      <ol className="flex gap-1 sm:gap-1.5 items-end overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {sorted.map((c, i) => {
          const level = FILL_BY_TIER[c.evidenceTier];
          const meta = EVIDENCE_TIER_META[c.evidenceTier];
          return (
            <li key={c.slug} className="flex-1 min-w-11 sm:min-w-0">
              <Link
                href={`/compounds/${c.slug}`}
                className="group/vial relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] rounded-md"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-2 top-6 rounded-full blur-xl transition-opacity duration-300 group-hover/vial:opacity-100"
                  style={{
                    background: "var(--color-amber)",
                    opacity: 0.06 + level * 0.24,
                  }}
                />
                <Vial
                  id={`rack-${c.slug}`}
                  level={level}
                  className="vial relative w-full h-auto transition-transform duration-300 ease-out group-hover/vial:-translate-y-2"
                />
                <span className="sr-only">
                  {c.name}, {meta.label}
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity duration-200 group-hover/vial:opacity-100 bg-[var(--bg-card)]"
                  style={{ borderColor: `color-mix(in oklab, ${meta.color} 45%, transparent)` }}
                >
                  {c.name}
                  <span className="ml-1.5 font-mono text-[10px]" style={{ color: meta.color }}>
                    {meta.short}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* The shelf: a lit edge plus the light that spills forward off it. */}
      <div className="h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--color-amber)_55%,transparent)] to-transparent" />

      {/*
        The axis. Because the vials are equal-width and sorted by tier, a strip
        of segments weighted by count lines up underneath them exactly, so the
        scale labels itself and the rack stops needing a separate legend.
      */}
      <div className="flex gap-1 sm:gap-1.5 mt-2.5">
        {bands.map((band) => (
          <Link
            key={band.tier}
            href={`/compounds?tier=${band.tier}`}
            className="group/band min-w-0 pt-2 border-t-2 transition-colors"
            style={{
              flexGrow: band.count,
              flexBasis: 0,
              borderColor: `color-mix(in oklab, ${band.color} 60%, transparent)`,
            }}
          >
            <span className="flex items-baseline gap-1.5">
              <span
                className="font-display text-lg font-semibold tabular-nums leading-none"
                style={{ color: band.color }}
              >
                {band.count}
              </span>
              {band.showLabel ? (
                <span className="label-xs truncate group-hover/band:text-[var(--text-muted)] transition-colors">
                  {band.label}
                </span>
              ) : (
                <span className="sr-only">{band.full}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
