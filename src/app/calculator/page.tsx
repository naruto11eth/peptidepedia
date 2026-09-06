import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ReconstitutionCalculator } from "@/components/reconstitution-calculator";
import { getRepository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Reconstitution calculator",
  description:
    "Convert a lyophilised vial and a target dose into insulin syringe units, with warnings when the volume is unmeasurable or exceeds the barrel.",
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ compound?: string }>;
}) {
  const repo = await getRepository();
  const compounds = await repo.summaries();
  const { compound } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Tool"
        title="Reconstitution calculator"
        description="The most-asked question in every peptide community, answered arithmetically. Pick a compound to preload realistic figures, or enter your own."
      />
      <ReconstitutionCalculator compounds={compounds} initialSlug={compound} />

      {/*
        Two short explainers, previously stacked in a narrow left column with
        the right half of the page empty. Side by side they fill the width and
        stay readable.
      */}
      <section className="mt-16 grid gap-x-12 gap-y-4 lg:grid-cols-2">
        <div className="prose-doc min-w-0">
        <h2>How the maths works</h2>
        <p>
          Reconstitution is one division and one multiplication. The vial contains a fixed mass of
          peptide; adding bacteriostatic water gives it a concentration; the dose you want divided by
          that concentration gives a volume; and volume converts to syringe units at a fixed rate.
        </p>
        <p>
          The rate is the part people get wrong. Insulin syringes are calibrated for U-100 insulin,
          where <strong>100 units = 1 mL</strong>. That is true on a 30-unit syringe, a 50-unit
          syringe and a 100-unit syringe alike - the number in the name is how much the barrel holds,
          not a different scale.
        </p>
        <p>
          <strong>How much water you add does not change your dose.</strong> It changes how many
          units you draw to get that dose. More water means a bigger, easier-to-read number on the
          barrel; less water means a smaller one. The peptide in the vial is fixed either way, which
          is why &ldquo;how many mg did I inject&rdquo; and &ldquo;how many units did I draw&rdquo;
          are only the same question once you know the concentration.
        </p>
        </div>

        <div className="prose-doc min-w-0">
        <h2>What it cannot do</h2>
        <p>
          This calculator assumes the vial contains what the label says. For unregulated material
          that assumption is doing enormous work - a vial labelled 10 mg that actually contains 6 mg
          produces a confidently wrong number here. See{" "}
          <a href="/safety">safety and sourcing</a> for what independent testing does and does not
          establish.
        </p>
        </div>
      </section>
    </div>
  );
}
