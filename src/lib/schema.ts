import { z } from "zod";

/**
 * Evidence tiers are the spine of this site's credibility. They describe the
 * strength of *human* evidence for the use people actually take the compound
 * for - not whether a molecule has any published research at all. A compound
 * with hundreds of rodent papers and zero human RCTs is `preclinical`.
 */
export const EVIDENCE_TIERS = ["approved", "trials", "preclinical", "anecdotal"] as const;
export type EvidenceTier = (typeof EVIDENCE_TIERS)[number];

export const EVIDENCE_TIER_META: Record<
  EvidenceTier,
  { label: string; short: string; description: string; color: string; rank: number }
> = {
  approved: {
    label: "FDA-approved",
    short: "Approved",
    description:
      "Approved by the FDA for at least one indication, with published phase 3 data and a regulated supply chain.",
    color: "var(--color-tier-approved)",
    rank: 4,
  },
  trials: {
    label: "Human trials",
    short: "Trials",
    description:
      "Randomised controlled human data exists and is published, but the compound is not approved for the use discussed here.",
    color: "var(--color-tier-trial)",
    rank: 3,
  },
  preclinical: {
    label: "Preclinical only",
    short: "Preclinical",
    description:
      "Evidence is cell-culture and animal work. No completed randomised controlled trial in humans for this use.",
    color: "var(--color-tier-preclinical)",
    rank: 2,
  },
  anecdotal: {
    label: "Anecdotal",
    short: "Anecdotal",
    description:
      "Human use is documented mainly through self-report. Treat every effect claim as unverified.",
    color: "var(--color-tier-anecdotal)",
    rank: 1,
  },
};

export const GOALS = [
  "fat-loss",
  "muscle",
  "healing",
  "skin",
  "hair",
  "gut",
  "longevity",
  "sleep",
  "libido",
  "hormones",
  "cognition",
  "endurance",
  "immunity",
  "bone",
] as const;
export type Goal = (typeof GOALS)[number];

export const GOAL_LABELS: Record<Goal, string> = {
  "fat-loss": "Fat loss",
  muscle: "Muscle",
  healing: "Injury healing",
  skin: "Skin",
  hair: "Hair",
  gut: "Gut",
  longevity: "Longevity",
  sleep: "Sleep",
  libido: "Libido",
  hormones: "Hormones",
  cognition: "Cognition",
  endurance: "Endurance",
  immunity: "Immunity",
  bone: "Bone",
};

export const CLASSES = [
  "incretin",
  "gh-secretagogue",
  "healing",
  "mitochondrial",
  "cosmetic",
  "hormonal",
  "pde5",
  "cofactor",
  "melanocortin",
  "nootropic",
  "immune",
  "longevity",
  "growth-factor",
  "metabolic",
  "neuropeptide",
] as const;
export type CompoundClass = (typeof CLASSES)[number];

export const CLASS_LABELS: Record<CompoundClass, string> = {
  incretin: "Incretin / GLP-1 class",
  "gh-secretagogue": "GH secretagogue",
  healing: "Healing & repair",
  mitochondrial: "Mitochondrial",
  cosmetic: "Skin & cosmetic",
  hormonal: "Hormonal",
  pde5: "PDE5 inhibitor",
  cofactor: "Metabolic cofactor",
  melanocortin: "Melanocortin agonist",
  nootropic: "Nootropic",
  immune: "Immune modulator",
  longevity: "Longevity",
  "growth-factor": "Growth factor",
  metabolic: "Metabolic",
  neuropeptide: "Neuropeptide",
};

export const ROUTES = ["subcutaneous", "intramuscular", "oral", "topical", "intranasal"] as const;
export type Route = (typeof ROUTES)[number];

export const CADENCES = [
  "weekly",
  "twice-weekly",
  "every-other-day",
  "daily",
  "5-on-2-off",
  "cycled",
  "as-needed",
] as const;
export type Cadence = (typeof CADENCES)[number];

export const CADENCE_LABELS: Record<Cadence, string> = {
  weekly: "Once weekly",
  "twice-weekly": "Twice weekly",
  "every-other-day": "Every other day",
  daily: "Daily",
  "5-on-2-off": "5 days on, 2 off",
  cycled: "Cycled (weeks on/off)",
  "as-needed": "As needed",
};

export const DOSE_UNITS = ["mg", "mcg", "iu"] as const;
export type DoseUnit = (typeof DOSE_UNITS)[number];

const citationSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
  kind: z.enum(["trial", "review", "regulatory", "news", "reference"]).default("reference"),
});

const doseRangeSchema = z.object({
  low: z.number().positive(),
  high: z.number().positive(),
  unit: z.enum(DOSE_UNITS),
  /** Per-administration, not per-week. The cadence field carries frequency. */
  note: z.string().optional(),
});

/**
 * Reconstitution defaults seed the calculator so each compound page opens on a
 * plausible starting state rather than an empty form.
 */
const reconstitutionSchema = z.object({
  vialMg: z.number().positive(),
  bacWaterMl: z.number().positive(),
  syringeUnits: z.union([z.literal(30), z.literal(50), z.literal(100)]).default(100),
});

export const compoundFrontmatterSchema = z.object({
  name: z.string().min(1),
  aka: z.array(z.string()).default([]),
  tagline: z.string().min(1).max(200),
  class: z.enum(CLASSES),
  evidenceTier: z.enum(EVIDENCE_TIERS),
  /** One sentence. Shown verbatim under the tier badge - keep it factual and current. */
  regulatoryStatus: z.string().min(1),
  goals: z.array(z.enum(GOALS)).min(1),
  routes: z.array(z.enum(ROUTES)).min(1),
  cadence: z.enum(CADENCES),
  cadenceNote: z.string().optional(),
  halfLife: z.string().min(1),
  reportedDose: doseRangeSchema.optional(),
  reconstitution: reconstitutionSchema.optional(),
  storage: z.string().optional(),
  sideEffects: z.array(z.string()).default([]),
  /** Things that warrant stopping or seeing a doctor, not just tolerating. */
  redFlags: z.array(z.string()).default([]),
  pairsWith: z.array(z.string()).default([]),
  cautionWith: z.array(z.string()).default([]),
  subreddits: z.array(z.string()).default([]),
  citations: z.array(citationSchema).default([]),
  updated: z.iso.date(),
  featured: z.boolean().default(false),
});

export type CompoundFrontmatter = z.infer<typeof compoundFrontmatterSchema>;

export type Compound = CompoundFrontmatter & {
  slug: string;
  body: string;
};

/** Everything the client bundle needs; deliberately excludes the MDX body. */
export type CompoundSummary = Omit<Compound, "body">;

export function toSummary(compound: Compound): CompoundSummary {
  const { body: _body, ...summary } = compound;
  return summary;
}
