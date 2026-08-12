"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { EvidenceBadge } from "@/components/evidence-badge";
import {
  getStackServerSnapshot,
  getStackSnapshot,
  subscribeToStack,
  writeStack,
} from "@/lib/stack-storage";
import {
  DAYS,
  decodeStack,
  encodeStack,
  findConflicts,
  scheduleFor,
  stackNotes,
  suggestForGoals,
} from "@/lib/stack";
import { CADENCE_LABELS, GOALS, GOAL_LABELS, type CompoundSummary, type Goal } from "@/lib/schema";

export function StackBuilder({
  compounds,
  sharedStack,
}: {
  compounds: CompoundSummary[];
  sharedStack: string[];
}) {
  const validSlugs = useMemo(() => new Set(compounds.map((c) => c.slug)), [compounds]);
  const [goals, setGoals] = useState<Set<Goal>>(new Set());
  const [copied, setCopied] = useState(false);
  // A shared link should not be silently overwritten by whatever this browser
  // had saved - it wins until the visitor edits it into their own stack.
  const [edited, setEdited] = useState(false);

  const stored = useSyncExternalStore(
    subscribeToStack,
    getStackSnapshot,
    getStackServerSnapshot,
  );

  const selected = useMemo(() => {
    if (sharedStack.length && !edited) return sharedStack;
    return decodeStack(stored, validSlugs);
  }, [sharedStack, edited, stored, validSlugs]);

  const setSelected = useCallback(
    (next: string[]) => {
      setEdited(true);
      writeStack(encodeStack(next));
    },
    [],
  );

  const chosen = useMemo(
    () =>
      selected
        .map((slug) => compounds.find((c) => c.slug === slug))
        .filter((c): c is CompoundSummary => Boolean(c)),
    [compounds, selected],
  );

  const suggestions = useMemo(
    () => suggestForGoals(compounds, goals).filter((c) => !selected.includes(c.slug)),
    [compounds, goals, selected],
  );

  const conflicts = useMemo(() => findConflicts(chosen), [chosen]);
  const notes = useMemo(() => stackNotes(chosen), [chosen]);

  function toggleGoal(goal: Goal) {
    setGoals((prev) => {
      const next = new Set(prev);
      if (!next.delete(goal)) next.add(goal);
      return next;
    });
  }

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?s=${encodeStack(selected)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="space-y-8">
      <section className="surface p-5 sm:p-6">
        <p className="label-xs mb-3">1 · What are you trying to do?</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              aria-pressed={goals.has(goal)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                goals.has(goal)
                  ? "border-[var(--color-accent-dim)] bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]"
              }`}
            >
              {GOAL_LABELS[goal]}
            </button>
          ))}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="space-y-3">
          <p className="label-xs">2 · Documented for those goals</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelected([...selected, c.slug])}
                className="surface p-3.5 text-left flex items-start gap-3 hover:border-[var(--border-strong)] transition-colors"
              >
                <span className="text-[var(--color-accent)] text-lg leading-none mt-0.5" aria-hidden>
                  +
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{c.name}</span>
                    <EvidenceBadge tier={c.evidenceTier} size="xs" />
                  </span>
                  <span className="block text-xs text-[var(--text-faint)] mt-1 line-clamp-2">
                    {c.tagline}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="label-xs">3 · Your stack</p>
          {chosen.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={share}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2"
              >
                {copied ? "Link copied" : "Copy share link"}
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {chosen.length === 0 ? (
          <div className="surface p-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Pick a goal above, or add compounds directly from the{" "}
              <Link href="/compounds" className="text-[var(--color-accent)] underline underline-offset-2">
                index
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="surface overflow-x-auto">
              <table className="w-full text-sm min-w-[42rem]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3.5 label-xs">Compound</th>
                    <th className="text-left p-3.5 label-xs">Cadence</th>
                    {DAYS.map((d) => (
                      <th key={d} className="p-3.5 label-xs text-center w-11">
                        {d}
                      </th>
                    ))}
                    <th className="w-11" />
                  </tr>
                </thead>
                <tbody>
                  {chosen.map((c) => {
                    const days = scheduleFor(c.cadence);
                    return (
                      <tr key={c.slug} className="border-b last:border-b-0">
                        <td className="p-3.5">
                          <Link
                            href={`/compounds/${c.slug}`}
                            className="font-medium hover:text-[var(--color-accent)] transition-colors"
                          >
                            {c.name}
                          </Link>
                          {c.reportedDose && (
                            <span className="block text-xs font-mono text-[var(--text-faint)] mt-0.5">
                              {c.reportedDose.low}-{c.reportedDose.high} {c.reportedDose.unit}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-[var(--text-muted)]">
                          {CADENCE_LABELS[c.cadence]}
                        </td>
                        {DAYS.map((d) => (
                          <td key={d} className="p-3.5 text-center">
                            {days.includes(d) ? (
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: "var(--color-accent)" }}
                                aria-label="dose"
                              />
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-[var(--border)]" aria-hidden />
                            )}
                          </td>
                        ))}
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setSelected(selected.filter((s) => s !== c.slug))}
                            aria-label={`Remove ${c.name}`}
                            className="text-[var(--text-faint)] hover:text-[var(--color-tier-anecdotal)] transition-colors"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(conflicts.length > 0 || notes.length > 0) && (
              <div className="space-y-2">
                {conflicts.map((c, i) => (
                  <Callout key={`c${i}`} level={c.level === "avoid" ? "error" : "warn"}>
                    {c.message}
                  </Callout>
                ))}
                {notes.map((n, i) => (
                  <Callout key={`n${i}`} level={n.level === "warn" ? "warn" : "info"}>
                    {n.message}
                  </Callout>
                ))}
              </div>
            )}

            <p className="text-xs text-[var(--text-faint)] leading-relaxed">
              This is a scheduling aid, not a protocol. It arranges what you selected onto a week and
              flags mechanical overlaps - it does not evaluate whether any of it is a good idea for
              you, and it has no knowledge of your labs, medications, or history.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function Callout({
  level,
  children,
}: {
  level: "error" | "warn" | "info";
  children: React.ReactNode;
}) {
  const color =
    level === "error"
      ? "var(--color-tier-anecdotal)"
      : level === "warn"
        ? "var(--color-tier-preclinical)"
        : "var(--color-tier-trial)";

  return (
    <div
      className="surface p-3.5 flex gap-3 text-sm"
      style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}
    >
      <span
        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color }}
        aria-hidden
      />
      <p className="text-[var(--text-muted)] leading-relaxed">{children}</p>
    </div>
  );
}
