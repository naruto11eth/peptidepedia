import type { DoseUnit } from "./schema";

/**
 * Insulin syringes are calibrated for U-100 insulin: 100 units = 1 mL, always.
 * The "30 / 50 / 100" in a syringe's name is barrel *capacity* in units
 * (0.3 / 0.5 / 1.0 mL), not a different scale. Every unit→volume conversion on
 * this site depends on that constant.
 */
export const UNITS_PER_ML = 100;

export type SyringeSize = 30 | 50 | 100;

export const SYRINGE_SIZES: { value: SyringeSize; label: string; ml: number }[] = [
  { value: 30, label: "U-100 · 0.3 mL (30 units)", ml: 0.3 },
  { value: 50, label: "U-100 · 0.5 mL (50 units)", ml: 0.5 },
  { value: 100, label: "U-100 · 1.0 mL (100 units)", ml: 1.0 },
];

export interface ReconstitutionInput {
  /** Peptide mass in the lyophilised vial, in milligrams. */
  vialMg: number;
  /** Bacteriostatic water added, in millilitres. */
  bacWaterMl: number;
  doseAmount: number;
  doseUnit: DoseUnit;
  syringeSize: SyringeSize;
  /** Only used to project how long one vial lasts. */
  dosesPerWeek?: number;
}

export interface ReconstitutionResult {
  /** mg of peptide per mL of solution. */
  concentrationMgPerMl: number;
  /** mcg of peptide per insulin unit - the number people actually memorise. */
  mcgPerUnit: number;
  doseMg: number;
  volumeMl: number;
  units: number;
  dosesPerVial: number;
  weeksPerVial: number | null;
  warnings: Warning[];
  valid: boolean;
}

export interface Warning {
  level: "error" | "warn" | "info";
  message: string;
}

const MG_PER_UNIT_OF: Record<DoseUnit, number> = {
  mg: 1,
  mcg: 0.001,
  // IU has no universal mass equivalent; it is compound-specific and must not be
  // silently converted. Flagged as an error below instead of guessed.
  iu: Number.NaN,
};

export function calculateReconstitution(input: ReconstitutionInput): ReconstitutionResult {
  const { vialMg, bacWaterMl, doseAmount, doseUnit, syringeSize, dosesPerWeek } = input;
  const warnings: Warning[] = [];

  const syringe = SYRINGE_SIZES.find((s) => s.value === syringeSize) ?? SYRINGE_SIZES[2]!;
  const doseMg = doseAmount * MG_PER_UNIT_OF[doseUnit];

  const invalid =
    !isFinite(vialMg) ||
    !isFinite(bacWaterMl) ||
    !isFinite(doseMg) ||
    vialMg <= 0 ||
    bacWaterMl <= 0 ||
    doseMg <= 0;

  if (doseUnit === "iu") {
    warnings.push({
      level: "error",
      message:
        "International units are compound-specific and have no fixed mass conversion. Use the mg or mcg equivalent from your vial label.",
    });
  }

  if (invalid) {
    return {
      concentrationMgPerMl: 0,
      mcgPerUnit: 0,
      doseMg: 0,
      volumeMl: 0,
      units: 0,
      dosesPerVial: 0,
      weeksPerVial: null,
      warnings: warnings.length
        ? warnings
        : [{ level: "error", message: "Enter a vial size, water volume, and dose above zero." }],
      valid: false,
    };
  }

  const concentrationMgPerMl = vialMg / bacWaterMl;
  const volumeMl = doseMg / concentrationMgPerMl;
  const units = volumeMl * UNITS_PER_ML;
  const mcgPerUnit = (concentrationMgPerMl * 1000) / UNITS_PER_ML;
  const dosesPerVial = vialMg / doseMg;

  if (units > syringe.value) {
    warnings.push({
      level: "error",
      message: `${round(units, 1)} units exceeds the ${syringe.value}-unit syringe. Use less bacteriostatic water, a larger syringe, or split the dose.`,
    });
  }

  if (bacWaterMl > 3) {
    warnings.push({
      level: "warn",
      message:
        "Most vials are 2-3 mL in capacity. Confirm the vial physically holds this much water before drawing it up.",
    });
  }

  // Below ~2 units the graduations on an insulin syringe are wider than the
  // dose itself, so measurement error dominates.
  if (units > 0 && units < 2) {
    warnings.push({
      level: "warn",
      message: `${round(units, 2)} units is too small to measure reliably. Add more bacteriostatic water to dilute - the dose stays the same, the volume gets readable.`,
    });
  }

  if (dosesPerVial > 0 && dosesPerVial < 1) {
    warnings.push({
      level: "warn",
      message: "This dose is larger than the entire vial.",
    });
  }

  return {
    concentrationMgPerMl,
    mcgPerUnit,
    doseMg,
    volumeMl,
    units,
    dosesPerVial,
    weeksPerVial: dosesPerWeek && dosesPerWeek > 0 ? dosesPerVial / dosesPerWeek : null,
    warnings,
    valid: !warnings.some((w) => w.level === "error"),
  };
}

export function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Chooses a water volume that lands the dose on a readable, round unit mark. */
export function suggestBacWater(vialMg: number, doseMg: number, syringeSize: SyringeSize): number {
  const candidates = [0.5, 1, 1.5, 2, 2.5, 3];
  let best = candidates[1]!;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const ml of candidates) {
    const units = (doseMg / (vialMg / ml)) * UNITS_PER_ML;
    if (units > syringeSize || units < 4) continue;
    // Prefer landing on a whole unit, then prefer mid-scale readings.
    const roundness = Math.abs(units - Math.round(units));
    const centering = Math.abs(units - syringeSize * 0.5) / syringeSize;
    const score = roundness * 2 + centering;
    if (score < bestScore) {
      bestScore = score;
      best = ml;
    }
  }
  return best;
}
