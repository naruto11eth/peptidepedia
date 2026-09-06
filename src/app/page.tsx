import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { EvidenceBadge } from "@/components/evidence-badge";
import { EvidenceRack } from "@/components/evidence-rack";
import { HeroVideo } from "@/components/hero-video";
import { getRepository } from "@/lib/repository";
import { EVIDENCE_TIER_META } from "@/lib/schema";

const TOOLS = [
  {
    href: "/calculator",
    title: "Reconstitution calculator",
    body: "Vial size and bacteriostatic water into syringe units, with warnings when a dose is too small to measure accurately.",
  },
  {
    href: "/compare",
    title: "Side-by-side compare",
    body: "Up to four compounds against each other on evidence, regulatory status, half-life, cadence and side effects.",
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
  /*
   * The lead card goes to the least-evidenced featured compound rather than
   * whichever sorts first alphabetically. The gap between how much a compound
   * is used and how much is known about it is the site's argument, so the entry
   * that embodies it hardest deserves the largest tile.
   */
  const featured = compounds
    .filter((c) => c.featured)
    .sort(
      (a, b) =>
        EVIDENCE_TIER_META[a.evidenceTier].rank - EVIDENCE_TIER_META[b.evidenceTier].rank ||
        a.name.localeCompare(b.name),
    );

  return (
    <>
      {/*
        The clip is composed around an empty, near-black centre, so the hero
        type sits inside the ring rather than beside it. Height is tied to the
        16:9 source so the hole stays centred as the viewport widens.
      */}
      <section className="relative isolate flex min-h-[clamp(32rem,56vw,48rem)] items-center justify-center overflow-hidden py-16 sm:py-20">
        <HeroVideo />

        <div className="relative mx-auto w-full min-w-0 max-w-2xl px-4 text-center sm:px-6">
          <p className="label-xs mb-6">{compounds.length} compounds · every claim cited</p>
          <h1 className="display text-[2.25rem] text-[var(--color-powder)] sm:text-5xl lg:text-6xl">
            Most of what you have read about peptides is{" "}
            <span className="text-[var(--color-accent)]">selling you something</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[var(--text-muted)] leading-relaxed">
            This is the other kind of page. Every entry is graded on how much human evidence
            actually exists.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/compounds"
              className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-on)] transition-colors hover:bg-[var(--color-accent-dim)]"
            >
              Browse compounds
            </Link>
            <Link
              href="/methodology"
              className="rounded-lg border border-[var(--border-strong)] bg-[color-mix(in_oklab,var(--bg)_55%,transparent)] px-5 py-2.5 text-sm backdrop-blur-sm transition-colors hover:border-[var(--text-faint)]"
            >
              How the grading works
            </Link>
          </div>
        </div>
      </section>

      {/*
        The rack does the arguing. Fill level is evidence, so the shape of the
        row is the finding: a handful of full vials, then a long tail of nearly
        empty ones.
      */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14 sm:mt-16">
        <EvidenceRack compounds={compounds} />
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <p className="text-sm text-[var(--text-muted)] max-w-lg leading-relaxed">
            Each vial is one compound. How full it is, is how much human evidence exists for the use
            people take it for. Hover to name one.
          </p>
          <p className="label-xs">Strongest to weakest</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-20 sm:mt-24">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 className="display text-2xl">Start here</h2>
          <Link
            href="/compounds"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            All compounds
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <Link
              key={c.slug}
              href={`/compounds/${c.slug}`}
              className="surface group flex min-w-0 flex-col gap-3 p-5 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                <h3 className="font-display font-semibold tracking-tight transition-colors group-hover:text-[var(--color-accent)]">
                  {c.name}
                </h3>
                <EvidenceBadge tier={c.evidenceTier} size="xs" />
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-5">
                {c.tagline}
              </p>
              <span className="mt-auto space-y-1 pt-2">
                <span className="label-xs block">Half-life</span>
                <span className="block font-mono text-xs text-[var(--text-muted)]">
                  {c.halfLife}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-20 sm:mt-24 pb-8">
        <h2 className="display text-2xl mb-6">Tools</h2>
        <div className="border-t">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start gap-5 border-b py-5 hover:bg-[color-mix(in_oklab,var(--bg-raised)_70%,transparent)] transition-colors sm:px-2"
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
