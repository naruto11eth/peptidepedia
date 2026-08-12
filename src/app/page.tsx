import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { EvidenceBadge } from "@/components/evidence-badge";
import { getRepository } from "@/lib/repository";
import { EVIDENCE_TIERS, EVIDENCE_TIER_META } from "@/lib/schema";

const TOOLS = [
  {
    href: "/calculator",
    title: "Reconstitution calculator",
    body: "Vial size and bacteriostatic water into syringe units, with a live readout and warnings when a dose is too small to measure accurately.",
  },
  {
    href: "/compare",
    title: "Side-by-side compare",
    body: "Up to four compounds against each other on evidence, regulatory status, half-life, cadence, dose and side effects.",
  },
  {
    href: "/stack",
    title: "Stack builder",
    body: "Pick goals, get a weekly schedule, and see which selections have mechanisms that overlap rather than combine.",
  },
] as const;

export default async function HomePage() {
  const repo = await getRepository();
  const compounds = await repo.summaries();
  const [lead, ...rest] = compounds.filter((c) => c.featured);

  const counts = Object.fromEntries(
    EVIDENCE_TIERS.map((tier) => [tier, compounds.filter((c) => c.evidenceTier === tier).length]),
  ) as Record<(typeof EVIDENCE_TIERS)[number], number>;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
        <p className="label-xs mb-5">
          {compounds.length} compounds · every claim cited
        </p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tighter leading-[1.05] max-w-3xl">
          What the evidence actually says about peptides.
        </h1>
        <p className="mt-6 text-lg text-[var(--text-muted)] max-w-xl leading-relaxed">
          Most of it is vendor copy in a lab coat. This separates human trials from mouse studies
          from forum posts.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/compounds"
            className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--accent-on)] font-medium text-sm hover:bg-[var(--color-accent-dim)] transition-colors"
          >
            Browse compounds
          </Link>
          <Link
            href="/methodology"
            className="px-5 py-2.5 rounded-lg border text-sm hover:border-[var(--border-strong)] transition-colors"
          >
            How the tiers work
          </Link>
        </div>
      </section>

      {/* Legend rather than a card grid: these are one scale, and rendering them
          as four separate tiles implied four unrelated categories. */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="border-t">
          {EVIDENCE_TIERS.map((tier) => {
            const meta = EVIDENCE_TIER_META[tier];
            return (
              <Link
                key={tier}
                href={`/compounds?tier=${tier}`}
                className="group flex flex-col gap-2 border-b py-5 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span
                  className="text-3xl font-semibold tabular-nums leading-none w-12 shrink-0"
                  style={{ color: meta.color }}
                >
                  {counts[tier]}
                </span>
                <span className="w-36 shrink-0">
                  <EvidenceBadge tier={tier} size="xs" />
                </span>
                <span className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
                  {meta.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold tracking-tight">Start here</h2>
          <Link
            href="/compounds"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            All compounds
          </Link>
        </div>

        {/* Asymmetric: the lead compound carries the section, the rest support it.
            Four equal tiles would read as four equally important entry points. */}
        <div className="grid gap-3 lg:grid-cols-3">
          {lead && (
            <Link
              href={`/compounds/${lead.slug}`}
              className="surface p-6 lg:row-span-3 flex flex-col gap-4 hover:border-[var(--border-strong)] transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                  {lead.name}
                </h3>
                <EvidenceBadge tier={lead.evidenceTier} size="xs" />
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed">{lead.tagline}</p>
              <span className="label-xs mt-auto pt-2">{lead.halfLife} half-life</span>
            </Link>
          )}

          <div className="lg:col-span-2 grid gap-3 sm:grid-cols-3">
            {rest.map((c) => (
              <Link
                key={c.slug}
                href={`/compounds/${c.slug}`}
                className="surface p-5 flex flex-col gap-3 hover:border-[var(--border-strong)] transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                    {c.name}
                  </h3>
                  <EvidenceBadge tier={c.evidenceTier} size="xs" />
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-4">
                  {c.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-5">Tools</h2>
        <div className="border-t">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start gap-5 border-b py-5 hover:bg-[var(--bg-raised)] transition-colors sm:px-2"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium group-hover:text-[var(--color-accent)] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-1.5 max-w-2xl">
                  {tool.body}
                </p>
              </div>
              <ArrowRightIcon
                size={18}
                className="mt-1 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--color-accent)] transition-colors"
              />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
