"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { EvidenceBadge } from "@/components/evidence-badge";
import {
  CADENCE_LABELS,
  CLASS_LABELS,
  GOAL_LABELS,
  type CompoundSummary,
} from "@/lib/schema";

const MAX_SELECTED = 4;

type Row = {
  label: string;
  render: (c: CompoundSummary) => React.ReactNode;
};

const ROWS: Row[] = [
  { label: "Evidence", render: (c) => <EvidenceBadge tier={c.evidenceTier} size="xs" /> },
  { label: "Class", render: (c) => CLASS_LABELS[c.class] },
  { label: "Regulatory status", render: (c) => c.regulatoryStatus },
  { label: "Route", render: (c) => c.routes.join(", ") },
  { label: "Cadence", render: (c) => CADENCE_LABELS[c.cadence] },
  { label: "Half-life", render: (c) => <span className="font-mono text-xs">{c.halfLife}</span> },
  {
    label: "Reported dose",
    render: (c) =>
      c.reportedDose ? (
        <span className="font-mono text-xs">
          {c.reportedDose.low}-{c.reportedDose.high} {c.reportedDose.unit}
        </span>
      ) : (
        <span className="text-[var(--text-faint)]"> - </span>
      ),
  },
  {
    label: "Goals",
    render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.goals.map((g) => (
          <span
            key={g}
            className="text-[11px] px-1.5 py-0.5 rounded border text-[var(--text-muted)]"
          >
            {GOAL_LABELS[g]}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: "Main side effects",
    render: (c) =>
      c.sideEffects.length ? (
        <ul className="space-y-1 text-xs">
          {c.sideEffects.slice(0, 3).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <span className="text-[var(--text-faint)]"> - </span>
      ),
  },
];

export function CompoundCompare({ compounds }: { compounds: CompoundSummary[] }) {
  const [selected, setSelected] = useState<string[]>(() =>
    compounds
      .filter((c) => c.featured)
      .slice(0, 3)
      .map((c) => c.slug),
  );

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, slug];
    });
  }, []);

  const chosen = useMemo(
    () =>
      selected
        .map((slug) => compounds.find((c) => c.slug === slug))
        .filter((c): c is CompoundSummary => Boolean(c)),
    [compounds, selected],
  );

  return (
    <div className="space-y-6">
      <div className="surface p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <p className="label-xs">Select up to {MAX_SELECTED}</p>
          <p className="text-xs text-[var(--text-faint)]">{chosen.length} selected</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {compounds.map((c) => {
            const active = selected.includes(c.slug);
            const full = !active && selected.length >= MAX_SELECTED;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                disabled={full}
                aria-pressed={active}
                className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  active
                    ? "border-[var(--color-accent-dim)] bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]"
                    : full
                      ? "text-[var(--text-faint)] opacity-40 cursor-not-allowed"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {chosen.length === 0 ? (
        <div className="surface p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Pick two or more compounds to compare.</p>
        </div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[var(--bg-card)] text-left p-4 label-xs w-40 min-w-40 border-b">
                  Attribute
                </th>
                {chosen.map((c) => (
                  <th key={c.slug} className="text-left p-4 min-w-56 border-b align-bottom">
                    <Link
                      href={`/compounds/${c.slug}`}
                      className="font-semibold tracking-tight hover:text-[var(--color-accent)] transition-colors"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs font-normal text-[var(--text-faint)] mt-1 normal-case tracking-normal font-sans">
                      {c.tagline}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <th className="sticky left-0 z-10 bg-[var(--bg-card)] text-left p-4 label-xs align-top font-normal">
                    {row.label}
                  </th>
                  {chosen.map((c) => (
                    <td key={c.slug} className="p-4 align-top text-[var(--text-muted)] leading-relaxed">
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
