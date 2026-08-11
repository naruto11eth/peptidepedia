"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Fuse from "fuse.js";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { EvidenceBadge } from "@/components/evidence-badge";
import {
  CADENCE_LABELS,
  CLASS_LABELS,
  EVIDENCE_TIER_META,
  EVIDENCE_TIERS,
  GOAL_LABELS,
  GOALS,
  type CompoundSummary,
  type EvidenceTier,
  type Goal,
} from "@/lib/schema";

export function CompoundBrowser({ compounds }: { compounds: CompoundSummary[] }) {
  const [query, setQuery] = useState("");
  const [goals, setGoals] = useState<Set<Goal>>(new Set());
  const [tiers, setTiers] = useState<Set<EvidenceTier>>(new Set());
  const deferredQuery = useDeferredValue(query);

  const fuse = useMemo(
    () =>
      new Fuse(compounds, {
        keys: [
          { name: "name", weight: 3 },
          { name: "aka", weight: 2 },
          { name: "tagline", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [compounds],
  );

  const results = useMemo(() => {
    const base = deferredQuery.trim()
      ? fuse.search(deferredQuery).map((r) => r.item)
      : [...compounds].sort(
          (a, b) =>
            EVIDENCE_TIER_META[b.evidenceTier].rank - EVIDENCE_TIER_META[a.evidenceTier].rank ||
            a.name.localeCompare(b.name),
        );

    return base.filter((c) => {
      if (goals.size && !c.goals.some((g) => goals.has(g))) return false;
      if (tiers.size && !tiers.has(c.evidenceTier)) return false;
      return true;
    });
  }, [compounds, deferredQuery, fuse, goals, tiers]);

  const activeGoals = useMemo(() => {
    const used = new Set<Goal>();
    for (const c of compounds) for (const g of c.goals) used.add(g);
    return GOALS.filter((g) => used.has(g));
  }, [compounds]);

  function toggle<T>(set: Set<T>, value: T, apply: (next: Set<T>) => void) {
    const next = new Set(set);
    if (!next.delete(value)) next.add(value);
    apply(next);
  }

  const filtersActive = goals.size > 0 || tiers.size > 0 || query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlassIcon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search compounds, brand names, aliases…"
          aria-label="Search compounds"
          className="w-full surface pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--color-accent-dim)] transition-colors"
        />
      </div>

      <div className="space-y-3">
        <FilterRow label="Goal">
          {activeGoals.map((goal) => (
            <Chip
              key={goal}
              active={goals.has(goal)}
              onClick={() => toggle(goals, goal, setGoals)}
            >
              {GOAL_LABELS[goal]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Evidence">
          {EVIDENCE_TIERS.map((tier) => (
            <Chip
              key={tier}
              active={tiers.has(tier)}
              accent={EVIDENCE_TIER_META[tier].color}
              onClick={() => toggle(tiers, tier, setTiers)}
              title={EVIDENCE_TIER_META[tier].description}
            >
              {EVIDENCE_TIER_META[tier].label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="label-xs">
          {results.length} of {compounds.length} compounds
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGoals(new Set());
              setTiers(new Set());
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2"
          >
            Reset
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Nothing matches those filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((c) => (
            <CompoundCard key={c.slug} compound={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-xs w-16 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  accent,
  onClick,
  title,
  children,
}: {
  active: boolean;
  accent?: string;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className="px-2.5 py-1 rounded-full border text-xs transition-colors"
      style={
        active
          ? {
              color: accent ?? "var(--color-accent)",
              borderColor: `color-mix(in oklab, ${accent ?? "var(--color-accent)"} 45%, transparent)`,
              background: `color-mix(in oklab, ${accent ?? "var(--color-accent)"} 12%, transparent)`,
            }
          : { color: "var(--text-muted)", borderColor: "var(--border)" }
      }
    >
      {children}
    </button>
  );
}

function CompoundCard({ compound }: { compound: CompoundSummary }) {
  return (
    <Link
      href={`/compounds/${compound.slug}`}
      className="surface p-4 flex flex-col gap-3 hover:border-[var(--border-strong)] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
            {compound.name}
          </h3>
          {compound.aka.length > 0 && (
            <p className="text-xs text-[var(--text-faint)] font-mono truncate mt-0.5">
              {compound.aka.join(", ")}
            </p>
          )}
        </div>
        <EvidenceBadge tier={compound.evidenceTier} size="xs" />
      </div>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
        {compound.tagline}
      </p>

      <div className="mt-auto pt-1 flex flex-wrap gap-x-4 gap-y-1 label-xs">
        <span>{CLASS_LABELS[compound.class]}</span>
        <span>{CADENCE_LABELS[compound.cadence]}</span>
      </div>
    </Link>
  );
}
