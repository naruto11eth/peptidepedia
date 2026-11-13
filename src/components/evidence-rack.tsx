import Link from "next/link";

import { FILL_BY_TIER, Vial, VialDefs } from "@/components/vial";
import { EVIDENCE_TIERS, EVIDENCE_TIER_META, type CompoundSummary } from "@/lib/schema";

/**
 * Codes printed on each vial's label. Purely presentational, so they live here
 * rather than in the content schema.
 *
 * Every compound is listed explicitly because the old slice-the-slug fallback
 * produced collisions once the reference grew: thymosin-alpha-1 and
 * thymosin-beta-4 both rendered THYMO. Any compound can turn up in the sampled
 * row, so all of them need a code.
 */
const LABEL_CODES: Record<string, string> = {
  "5-amino-1mq": "1MQ",
  afamelanotide: "AFA",
  amycretin: "AMY",
  anastrozole: "ANAS",
  "aod-9604": "AOD",
  "ara-290": "ARA",
  argireline: "ARGI",
  bimagrumab: "BIMA",
  "bpc-157": "BPC",
  bremelanotide: "PT141",
  cagrilintide: "CAGRI",
  cagrisema: "CAGSE",
  cerebrolysin: "CEREB",
  "cjc-1295": "CJC",
  dihexa: "DIHEX",
  dsip: "DSIP",
  dulaglutide: "DULA",
  dutasteride: "DUTA",
  enclomiphene: "ENCLO",
  epitalon: "EPI",
  exenatide: "EXEN",
  finasteride: "FINA",
  fisetin: "FIS",
  "follistatin-344": "FST",
  "ghk-cu": "GHK",
  "ghrp-2": "GHRP2",
  "ghrp-6": "GHRP6",
  glutathione: "GSH",
  gonadorelin: "GNRH",
  hcg: "HCG",
  hexarelin: "HEXA",
  "hgh-fragment-176-191": "FRAG",
  humanin: "HUMN",
  "igf-1-lr3": "LR3",
  ipamorelin: "IPA",
  "kisspeptin-10": "KISS",
  kpv: "KPV",
  larazotide: "LARA",
  liraglutide: "LIRA",
  "ll-37": "LL37",
  matrixyl: "MTX",
  mazdutide: "MAZD",
  mecasermin: "MECA",
  "melanotan-2": "MT2",
  metformin: "MET",
  "methylene-blue": "MB",
  "mk-677": "MK677",
  "mots-c": "MOTS",
  "nad-plus": "NAD+",
  "nicotinamide-riboside": "NR",
  nmn: "NMN",
  noopept: "NOOP",
  orforglipron: "ORFO",
  oxytocin: "OXY",
  "peg-mgf": "MGF",
  "pentadeca-arginate": "PDA",
  rapamycin: "RAPA",
  retatrutide: "RETA",
  selank: "SELK",
  semaglutide: "SEMA",
  semax: "SEMAX",
  sermorelin: "SERM",
  setmelanotide: "SETM",
  sildenafil: "SILD",
  "slu-pp-332": "SLU",
  somatropin: "HGH",
  spermidine: "SPRM",
  "ss-31": "SS31",
  survodutide: "SURV",
  tadalafil: "TADA",
  "tb-500": "TB500",
  teriparatide: "TERI",
  tesamorelin: "TESA",
  tesofensine: "TESO",
  thymalin: "THYML",
  "thymosin-alpha-1": "TA1",
  "thymosin-beta-4": "TB4",
  tirzepatide: "TIRZ",
  vardenafil: "VARD",
  vip: "VIP",
};

const codeFor = (slug: string) =>
  LABEL_CODES[slug] ?? slug.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase();

if (process.env.NODE_ENV !== "production") {
  const seen = new Map<string, string>();
  for (const [slug, code] of Object.entries(LABEL_CODES)) {
    const clash = seen.get(code);
    if (clash) throw new Error(`Duplicate vial label code "${code}": ${clash} and ${slug}`);
    seen.set(code, slug);
  }
}

/**
 * Sixteen reads as one row on desktop and two tidy rows of eight on a phone,
 * at a width where the label on the glass is still legible. Drawing all eighty
 * gave each vial about eight pixels and turned the row into a smear.
 */
const ROW_SIZE = 16;

/** Evenly spaced picks, so the sample is stable and spread across the list. */
function sampleEvenly<T>(items: readonly T[], n: number): T[] {
  if (n <= 0 || items.length === 0) return [];
  if (n >= items.length) return [...items];

  const last = items.length - 1;
  const out: T[] = [];
  for (let i = 0; i < n; i += 1) {
    const pick = items[n === 1 ? 0 : Math.round((i * last) / (n - 1))];
    if (pick === undefined) continue;
    out.push(pick);
  }
  return out;
}

/**
 * Largest-remainder allocation, so the row's mix mirrors the real tier split
 * and the seats still add up to exactly ROW_SIZE. Every non-empty tier gets at
 * least one vial: the three anecdotal compounds round to zero otherwise, and
 * the emptiest vial on the shelf is the one most worth seeing.
 */
function allocate(counts: readonly number[], total: number): number[] {
  const sum = counts.reduce((a, b) => a + b, 0);
  if (sum === 0 || total <= 0) return counts.map(() => 0);

  const exact = counts.map((c) => (c / sum) * total);
  const seats = exact.map((e, i) => ((counts[i] ?? 0) > 0 ? Math.max(1, Math.floor(e)) : 0));
  const order = exact
    .map((e, i) => ({ i, rem: e - Math.floor(e) }))
    .sort((a, b) => b.rem - a.rem);

  let spare = total - seats.reduce((a, b) => a + b, 0);
  for (let k = 0; spare > 0 && order.length > 0; k += 1, spare -= 1) {
    const target = order[k % order.length];
    if (target) seats[target.i] = (seats[target.i] ?? 0) + 1;
  }
  // Taking back seats stops at one per tier, both to keep every tier visible
  // and because otherwise a ROW_SIZE below the tier count would never settle.
  while (spare < 0) {
    let biggest = 0;
    for (let i = 1; i < seats.length; i += 1) {
      if ((seats[i] ?? 0) > (seats[biggest] ?? 0)) biggest = i;
    }
    if ((seats[biggest] ?? 0) <= 1) break;
    seats[biggest] = (seats[biggest] ?? 0) - 1;
    spare += 1;
  }
  return seats;
}

/**
 * The rack is the site's signature: vials whose fill is how much human evidence
 * actually exists, strongest to weakest.
 *
 * It shows a sample rather than the whole reference. Drawing every compound was
 * honest and unreadable once there were eighty of them, and an index already
 * exists at /compounds. The axis underneath carries the real totals, so the row
 * can be a flourish without the numbers becoming decorative too.
 */
export function EvidenceRack({ compounds }: { compounds: CompoundSummary[] }): React.ReactElement {
  const tiers = EVIDENCE_TIERS.slice()
    .sort((a, b) => EVIDENCE_TIER_META[b].rank - EVIDENCE_TIER_META[a].rank)
    .map((tier) => ({
      tier,
      meta: EVIDENCE_TIER_META[tier],
      items: compounds
        .filter((c) => c.evidenceTier === tier)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((t) => t.items.length > 0);

  const seats = allocate(
    tiers.map((t) => t.items.length),
    Math.min(ROW_SIZE, compounds.length),
  );

  const row = tiers.flatMap((t, i) =>
    sampleEvenly(t.items, seats[i] ?? 0).map((c) => ({ compound: c, meta: t.meta })),
  );

  const bands = tiers.map((t) => ({
    tier: t.tier,
    label: t.meta.short,
    full: t.meta.label,
    color: t.meta.color,
    count: t.items.length,
    // A band too narrow for its word is better left to the count and the rule
    // than given a truncated "ANECD...".
    showLabel: t.items.length / compounds.length >= 0.12,
  }));

  return (
    <div className="relative">
      <VialDefs />

      {/*
        overflow-x-clip, not hidden: clip leaves the vertical axis visible, so a
        hover label can still rise above the shelf while the outermost vial's
        label cannot widen the page.
      */}
      <ol className="grid grid-cols-8 items-end gap-1.5 overflow-x-clip sm:grid-cols-16 sm:gap-2">
        {row.map(({ compound: c, meta }, i) => {
          const level = FILL_BY_TIER[c.evidenceTier];
          return (
            <li key={c.slug}>
              <Link
                href={`/compounds/${c.slug}`}
                className="group/vial relative block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-2 top-6 rounded-full blur-lg transition-opacity duration-300 group-hover/vial:opacity-100"
                  style={{ background: "var(--color-amber)", opacity: 0.05 + level * 0.2 }}
                />
                <Vial
                  level={level}
                  label={codeFor(c.slug)}
                  className="vial relative h-auto w-full transition-transform duration-300 ease-out group-hover/vial:-translate-y-2"
                />
                <span className="sr-only">
                  {c.name}, {meta.label}
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-1 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border bg-[var(--bg-card)] px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity duration-200 group-hover/vial:opacity-100 sm:block"
                  style={{ borderColor: `color-mix(in oklab, ${meta.color} 45%, transparent)` }}
                >
                  {c.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* The shelf: a lit edge plus the light that spills forward off it. */}
      <div className="mt-1 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--color-amber)_55%,transparent)] to-transparent" />

      {/*
        The axis carries the real totals for all eighty compounds, weighted by
        count, so the segment widths are the distribution even though the row
        above them is a sample.
      */}
      <div className="mt-2.5 flex gap-1 sm:gap-1.5">
        {bands.map((band) => (
          <Link
            key={band.tier}
            href={`/compounds?tier=${band.tier}`}
            className="group/band min-w-0 border-t-2 pt-2 transition-colors"
            style={{
              flexGrow: band.count,
              flexBasis: 0,
              borderColor: `color-mix(in oklab, ${band.color} 60%, transparent)`,
            }}
          >
            <span className="flex items-baseline gap-1.5">
              <span
                className="font-display text-lg font-semibold leading-none tabular-nums"
                style={{ color: band.color }}
              >
                {band.count}
              </span>
              {band.showLabel ? (
                <span className="label-xs truncate transition-colors group-hover/band:text-[var(--text-muted)]">
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
