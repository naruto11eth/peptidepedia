"use client";

import { useMemo, useState } from "react";

import {
  SYRINGE_SIZES,
  type SyringeSize,
  calculateReconstitution,
  round,
} from "@/lib/reconstitution";
import { DOSE_UNITS, type CompoundSummary, type DoseUnit } from "@/lib/schema";

const DOSES_PER_WEEK: Record<string, number> = {
  weekly: 1,
  "twice-weekly": 2,
  "every-other-day": 3.5,
  daily: 7,
  "5-on-2-off": 5,
  cycled: 3,
  "as-needed": 1,
};

const FALLBACK = { vialMg: 10, bacWaterMl: 2, doseAmount: 2.5, doseUnit: "mg" as DoseUnit, syringeSize: 100 as SyringeSize };

/**
 * Selecting a compound seeds the form from its documented defaults, so the page
 * opens on a realistic scenario. That seeding happens here rather than in an
 * effect - it is a response to an event (or to the initial prop), not a
 * synchronisation with anything external.
 */
function seedFrom(compound: CompoundSummary | undefined) {
  if (!compound) return FALLBACK;
  return {
    vialMg: compound.reconstitution?.vialMg ?? FALLBACK.vialMg,
    bacWaterMl: compound.reconstitution?.bacWaterMl ?? FALLBACK.bacWaterMl,
    syringeSize: compound.reconstitution?.syringeUnits ?? FALLBACK.syringeSize,
    doseAmount: compound.reportedDose?.low ?? FALLBACK.doseAmount,
    doseUnit: compound.reportedDose?.unit ?? FALLBACK.doseUnit,
  };
}

export function ReconstitutionCalculator({
  compounds,
  initialSlug = "",
}: {
  compounds: CompoundSummary[];
  initialSlug?: string;
}) {
  const initial = seedFrom(compounds.find((c) => c.slug === initialSlug));

  const [slug, setSlug] = useState(initialSlug);
  const [vialMg, setVialMg] = useState(initial.vialMg);
  const [bacWaterMl, setBacWaterMl] = useState(initial.bacWaterMl);
  const [doseAmount, setDoseAmount] = useState(initial.doseAmount);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>(initial.doseUnit);
  const [syringeSize, setSyringeSize] = useState<SyringeSize>(initial.syringeSize);

  const selected = useMemo(() => compounds.find((c) => c.slug === slug), [compounds, slug]);

  function selectCompound(nextSlug: string) {
    const seed = seedFrom(compounds.find((c) => c.slug === nextSlug));
    setSlug(nextSlug);
    setVialMg(seed.vialMg);
    setBacWaterMl(seed.bacWaterMl);
    setSyringeSize(seed.syringeSize);
    setDoseAmount(seed.doseAmount);
    setDoseUnit(seed.doseUnit);
  }

  const dosesPerWeek = selected ? DOSES_PER_WEEK[selected.cadence] : undefined;

  const result = useMemo(
    () =>
      calculateReconstitution({
        vialMg,
        bacWaterMl,
        doseAmount,
        doseUnit,
        syringeSize,
        dosesPerWeek,
      }),
    [vialMg, bacWaterMl, doseAmount, doseUnit, syringeSize, dosesPerWeek],
  );

  const injectable = compounds.filter((c) => c.reconstitution);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="surface p-5 sm:p-6 space-y-5">
        <Field label="Compound" hint="Optional - seeds the fields below">
          <select
            value={slug}
            onChange={(e) => selectCompound(e.target.value)}
            className="w-full bg-[var(--bg-raised)] border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent-dim)]"
          >
            <option value="">Custom / not listed</option>
            {injectable.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Peptide in vial" hint="mg">
            <NumberInput value={vialMg} onChange={setVialMg} step={0.5} min={0.1} />
          </Field>
          <Field label="Bacteriostatic water" hint="mL">
            <NumberInput value={bacWaterMl} onChange={setBacWaterMl} step={0.25} min={0.1} />
          </Field>
        </div>

        <Field label="Target dose">
          <div className="flex gap-2">
            <NumberInput value={doseAmount} onChange={setDoseAmount} step={0.25} min={0.001} />
            <select
              value={doseUnit}
              onChange={(e) => setDoseUnit(e.target.value as DoseUnit)}
              aria-label="Dose unit"
              className="bg-[var(--bg-raised)] border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent-dim)]"
            >
              {DOSE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field label="Syringe">
          <div className="grid gap-1.5">
            {SYRINGE_SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSyringeSize(s.value)}
                aria-pressed={syringeSize === s.value}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  syringeSize === s.value
                    ? "border-[var(--color-accent-dim)] bg-[color-mix(in_oklab,var(--color-accent)_10%,transparent)] text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="space-y-4">
        <div className="surface p-5 sm:p-6 space-y-5">
          <div>
            <p className="label-xs mb-2">Draw to</p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl sm:text-6xl font-semibold tabular-nums tracking-tight"
                style={{ color: result.valid ? "var(--color-accent)" : "var(--color-tier-anecdotal)" }}
              >
                {result.units > 0 ? round(result.units, 1) : " - "}
              </span>
              <span className="text-lg text-[var(--text-muted)]">units</span>
            </div>
            <p className="text-sm text-[var(--text-faint)] mt-1 font-mono">
              {round(result.volumeMl, 3)} mL · {round(result.concentrationMgPerMl, 2)} mg/mL ·{" "}
              {round(result.mcgPerUnit, 1)} mcg per unit
            </p>
          </div>

          <Syringe units={result.units} capacity={syringeSize} valid={result.valid} />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Stat label="Doses per vial" value={result.dosesPerVial > 0 ? round(result.dosesPerVial, 1) : " - "} />
            <Stat
              label="Vial lasts"
              value={result.weeksPerVial ? `${round(result.weeksPerVial, 1)} wk` : " - "}
            />
          </div>
        </div>

        {result.warnings.length > 0 && (
          <div className="space-y-2">
            {result.warnings.map((w, i) => (
              <div
                key={i}
                className="surface p-3.5 flex gap-3 text-sm"
                style={{
                  borderColor:
                    w.level === "error"
                      ? "color-mix(in oklab, var(--color-tier-anecdotal) 40%, transparent)"
                      : "color-mix(in oklab, var(--color-tier-preclinical) 35%, transparent)",
                }}
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      w.level === "error"
                        ? "var(--color-tier-anecdotal)"
                        : "var(--color-tier-preclinical)",
                  }}
                  aria-hidden
                />
                <p className="text-[var(--text-muted)] leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-[var(--text-faint)] leading-relaxed px-1">
          Arithmetic only. This tool converts a vial and a target dose into syringe units - it does
          not tell you what dose to take, and it cannot verify that the vial contains what the label
          claims.
        </p>
      </div>
    </div>
  );
}

function Syringe({
  units,
  capacity,
  valid,
}: {
  units: number;
  capacity: SyringeSize;
  valid: boolean;
}) {
  const fill = Math.max(0, Math.min(1, units / capacity));
  const ticks = capacity === 30 ? 6 : capacity === 50 ? 5 : 10;
  const color = valid ? "var(--color-accent)" : "var(--color-tier-anecdotal)";

  return (
    <div className="space-y-2" role="img" aria-label={`Syringe filled to ${round(units, 1)} of ${capacity} units`}>
      <div className="relative h-11 rounded-md border overflow-hidden bg-[var(--bg-raised)]">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
          style={{
            width: `${fill * 100}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 22%, transparent), color-mix(in oklab, ${color} 42%, transparent))`,
            borderRight: `2px solid ${color}`,
          }}
        />
        <div className="absolute inset-0 flex">
          {Array.from({ length: ticks }, (_, i) => (
            <div key={i} className="flex-1 border-r last:border-r-0 border-[var(--border)]" />
          ))}
        </div>
      </div>
      <div className="flex justify-between label-xs">
        <span>0</span>
        <span>{capacity / 2}</span>
        <span>{capacity} units</span>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-baseline justify-between gap-2">
        <span className="label-xs">{label}</span>
        {hint && <span className="text-[11px] text-[var(--text-faint)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  min,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={Number.isFinite(value) ? value : ""}
      step={step}
      min={min}
      onChange={(e) => onChange(e.target.valueAsNumber)}
      className="w-full bg-[var(--bg-raised)] border rounded-lg px-3 py-2.5 text-sm font-mono tabular-nums outline-none focus:border-[var(--color-accent-dim)]"
    />
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--bg-raised)] border rounded-lg px-3.5 py-3">
      <p className="label-xs mb-1">{label}</p>
      <p className="text-lg font-medium tabular-nums">{value}</p>
    </div>
  );
}
