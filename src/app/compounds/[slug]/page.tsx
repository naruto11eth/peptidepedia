import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";

import { CommunitySection } from "@/components/community-section";
import { EvidenceBadge } from "@/components/evidence-badge";
import { mdxComponents } from "@/components/mdx";
import { getRedditCache } from "@/lib/reddit";
import { getRepository } from "@/lib/repository";
import {
  CADENCE_LABELS,
  CLASS_LABELS,
  EVIDENCE_TIER_META,
  GOAL_LABELS,
  type Compound,
} from "@/lib/schema";

export async function generateStaticParams() {
  const repo = await getRepository();
  return (await repo.slugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const compound = await repo.bySlug(slug);
  if (!compound) return {};

  return {
    title: compound.name,
    description: compound.tagline,
    keywords: [compound.name, ...compound.aka],
    openGraph: { title: compound.name, description: compound.tagline, type: "article" },
  };
}

export default async function CompoundPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepository();
  const compound = await repo.bySlug(slug);
  if (!compound) notFound();

  const all = await repo.summaries();
  const related = [...compound.pairsWith, ...compound.cautionWith]
    .map((s) => all.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const reddit = await getRedditCache(slug);
  const tier = EVIDENCE_TIER_META[compound.evidenceTier];

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <Link
        href="/compounds"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5 mb-8"
      >
        <ArrowLeftIcon size={15} aria-hidden /> All compounds
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <EvidenceBadge tier={compound.evidenceTier} />
          <span className="label-xs">{CLASS_LABELS[compound.class]}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter">{compound.name}</h1>
        {compound.aka.length > 0 && (
          <p className="mt-2 font-mono text-sm text-[var(--text-faint)]">
            {compound.aka.join(", ")}
          </p>
        )}
        <p className="mt-5 text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl">
          {compound.tagline}
        </p>
      </header>

      <div
        className="surface p-4 sm:p-5 mb-10 flex gap-3.5"
        style={{ borderColor: `color-mix(in oklab, ${tier.color} 30%, transparent)` }}
      >
        <span
          className="mt-1.5 w-2 h-2 rounded-full shrink-0"
          style={{ background: tier.color }}
          aria-hidden
        />
        <div className="space-y-1.5">
          <p className="text-sm font-medium" style={{ color: tier.color }}>
            {tier.label}
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {compound.regulatoryStatus}
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="prose-doc min-w-0 order-2 lg:order-1">
          <MDXRemote
            source={compound.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />

          <SideEffects compound={compound} />

          {compound.citations.length > 0 && (
            <section>
              <h2 id="sources">Sources</h2>
              <ol className="space-y-2">
                {compound.citations.map((c) => (
                  <li key={c.url}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      {c.label}
                    </a>
                    <span className="label-xs ml-2">{c.kind}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <CommunitySection cache={reddit} subreddits={compound.subreddits} />
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-20 space-y-3">
          <div className="surface p-5 space-y-4">
            <p className="label-xs">At a glance</p>
            <SpecRow label="Cadence" value={CADENCE_LABELS[compound.cadence]} />
            {compound.cadenceNote && (
              <p className="text-xs text-[var(--text-faint)] leading-relaxed -mt-2">
                {compound.cadenceNote}
              </p>
            )}
            <SpecRow label="Half-life" value={compound.halfLife} mono />
            <SpecRow label="Route" value={compound.routes.join(", ")} />
            {compound.reportedDose && (
              <>
                <SpecRow
                  label="Reported dose"
                  value={`${compound.reportedDose.low}-${compound.reportedDose.high} ${compound.reportedDose.unit}`}
                  mono
                />
                {compound.reportedDose.note && (
                  <p className="text-xs text-[var(--text-faint)] leading-relaxed -mt-2">
                    {compound.reportedDose.note}
                  </p>
                )}
              </>
            )}
            {compound.storage && <SpecRow label="Storage" value={compound.storage} />}
          </div>

          <div className="surface p-5">
            <p className="label-xs mb-3">Used for</p>
            <div className="flex flex-wrap gap-1.5">
              {compound.goals.map((g) => (
                <span
                  key={g}
                  className="text-xs px-2 py-1 rounded-md border text-[var(--text-muted)]"
                >
                  {GOAL_LABELS[g]}
                </span>
              ))}
            </div>
          </div>

          {compound.reconstitution && (
            <Link
              href={`/calculator?compound=${compound.slug}`}
              className="surface p-5 block hover:border-[var(--border-strong)] transition-colors group"
            >
              <p className="label-xs mb-1.5">Tool</p>
              <p className="text-sm font-medium group-hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1.5">
                Reconstitution calculator
                <ArrowRightIcon size={14} aria-hidden />
              </p>
              <p className="text-xs text-[var(--text-faint)] mt-1.5 leading-relaxed">
                Preloaded with {compound.reconstitution.vialMg} mg in{" "}
                {compound.reconstitution.bacWaterMl} mL.
              </p>
            </Link>
          )}

          {related.length > 0 && (
            <div className="surface p-5">
              <p className="label-xs mb-3">Related</p>
              <ul className="space-y-2.5">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/compounds/${r.slug}`}
                      className="text-sm hover:text-[var(--color-accent)] transition-colors flex items-center gap-2"
                    >
                      {r.name}
                      <span className="label-xs">
                        {compound.cautionWith.includes(r.slug) ? "caution" : "pairs"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-[var(--text-faint)] px-1">
            Last reviewed {compound.updated}
          </p>
        </aside>
      </div>
    </article>
  );
}

function SideEffects({ compound }: { compound: Compound }) {
  if (!compound.sideEffects.length && !compound.redFlags.length) return null;

  return (
    <section>
      <h2 id="side-effects">Side effects and warning signs</h2>
      {compound.sideEffects.length > 0 && (
        <>
          <h3 id="commonly-reported">Commonly reported</h3>
          <ul>
            {compound.sideEffects.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {compound.redFlags.length > 0 && (
        <>
          <h3 id="stop-and-get-help">Stop and get medical help</h3>
          <div
            className="not-prose surface p-4 sm:p-5"
            style={{ borderColor: "color-mix(in oklab, var(--color-tier-anecdotal) 35%, transparent)" }}
          >
            <ul className="space-y-3">
              {compound.redFlags.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)] leading-relaxed">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--color-tier-anecdotal)" }}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="label-xs">{label}</p>
      <p className={`text-sm text-[var(--text-muted)] leading-relaxed ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
