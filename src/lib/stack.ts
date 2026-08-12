import { CLASS_LABELS, type Cadence, type CompoundSummary, type Goal } from "./schema";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

/**
 * Maps a dosing cadence onto a concrete week. Weekly compounds are anchored to
 * Monday purely so the grid has something to draw - the actual day is arbitrary
 * as long as it stays consistent week to week.
 */
const SCHEDULE: Record<Cadence, readonly Day[]> = {
  weekly: ["Mon"],
  "twice-weekly": ["Mon", "Thu"],
  "every-other-day": ["Mon", "Wed", "Fri", "Sun"],
  daily: DAYS,
  "5-on-2-off": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  cycled: ["Mon", "Wed", "Fri"],
  "as-needed": [],
};

export function scheduleFor(cadence: Cadence): readonly Day[] {
  return SCHEDULE[cadence];
}

export interface StackConflict {
  level: "avoid" | "caution";
  slugs: [string, string];
  message: string;
}

/**
 * Two independent checks: explicit pairwise cautions declared in content, and a
 * structural rule that stacking compounds from the same class usually multiplies
 * side effects without multiplying effect.
 */
export function findConflicts(selected: CompoundSummary[]): StackConflict[] {
  const conflicts: StackConflict[] = [];
  const seen = new Set<string>();

  const key = (a: string, b: string) => [a, b].sort().join("|");

  for (const a of selected) {
    for (const b of selected) {
      if (a.slug === b.slug) continue;
      const k = key(a.slug, b.slug);
      if (seen.has(k)) continue;

      if (a.cautionWith.includes(b.slug) || b.cautionWith.includes(a.slug)) {
        seen.add(k);
        conflicts.push({
          level: "avoid",
          slugs: [a.slug, b.slug],
          message: `${a.name} and ${b.name} are flagged against each other. Running both adds side effects without adding benefit.`,
        });
        continue;
      }

      if (a.class === b.class) {
        seen.add(k);
        conflicts.push({
          level: "caution",
          slugs: [a.slug, b.slug],
          message: `${a.name} and ${b.name} are both in the ${CLASS_LABELS[a.class].toLowerCase()} category. Overlapping mechanisms usually mean overlapping side effects.`,
        });
      }
    }
  }

  return conflicts;
}

export interface StackNote {
  level: "info" | "warn";
  message: string;
}

export function stackNotes(selected: CompoundSummary[]): StackNote[] {
  const notes: StackNote[] = [];
  const slugs = new Set(selected.map((c) => c.slug));

  const injections = selected.filter((c) => c.routes.some((r) => r !== "oral" && r !== "topical"));
  const dailyInjections = injections.filter((c) => scheduleFor(c.cadence).length >= 5);

  if (dailyInjections.length >= 3) {
    notes.push({
      level: "warn",
      message: `${dailyInjections.length} compounds here need near-daily injections. That is a lot of sites to rotate and a lot of adherence to sustain - most people quietly drop one within a month.`,
    });
  }

  const unapproved = selected.filter((c) => c.evidenceTier === "preclinical" || c.evidenceTier === "anecdotal");
  if (unapproved.length >= 3) {
    notes.push({
      level: "warn",
      message: `${unapproved.length} of these have no human efficacy trials. Running several unknowns at once means that if something goes right or wrong, you will not know which one caused it.`,
    });
  }

  if (selected.some((c) => c.class === "incretin") && !selected.some((c) => c.goals.includes("muscle"))) {
    notes.push({
      level: "info",
      message:
        "Incretins drive lean mass loss alongside fat. Nothing in this stack counteracts that - a protein floor and resistance training do more for body composition here than any additional compound.",
    });
  }

  if (slugs.has("ipamorelin") && slugs.has("cjc-1295")) {
    notes.push({
      level: "info",
      message:
        "CJC-1295 with ipamorelin is the standard GH-axis pairing: a GHRH analogue plus a ghrelin receptor agonist hit two different levers on the same pulse. Use the no-DAC version of CJC-1295 if the goal is pulsatile release.",
    });
  }

  if (slugs.has("bpc-157") && slugs.has("tb-500")) {
    notes.push({
      level: "info",
      message:
        "The canonical healing pair. Worth being clear-eyed that both are preclinical-only, so this is two unproven compounds rather than a proven combination.",
    });
  }

  return notes;
}

export function suggestForGoals(compounds: CompoundSummary[], goals: Set<Goal>): CompoundSummary[] {
  if (!goals.size) return [];
  return compounds
    .map((c) => ({ compound: c, hits: c.goals.filter((g) => goals.has(g)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || b.compound.name.localeCompare(a.compound.name))
    .map((x) => x.compound);
}

export function encodeStack(slugs: string[]): string {
  return slugs.join(",");
}

export function decodeStack(value: string | null, valid: Set<string>): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => valid.has(s));
}
