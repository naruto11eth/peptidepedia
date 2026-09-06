import type { Metadata } from "next";

import { CompoundCompare } from "@/components/compound-compare";
import { PageHeader } from "@/components/page-header";
import { getRepository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Put compounds side by side on evidence tier, regulatory status, half-life, cadence, dose and side effects.",
};

export default async function ComparePage() {
  const repo = await getRepository();
  const compounds = await repo.summaries();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Tool"
        title="Compare"
        description="Up to four at a time, on the attributes that actually differ between them."
      />
      <CompoundCompare compounds={compounds} />

      {/*
        The table has six columns and was being clipped inside a max-w-2xl
        column while half the page sat empty. It now takes the wide side of a
        two-column split, with the commentary beside it.
      */}
      <section className="mt-16">
        <div className="prose-doc max-w-2xl">
        <h2>The GLP class, at matched doses</h2>
        <p>
          The three incretins in this reference are the most frequently compared compounds on the
          site, and the comparison is routinely done badly - usually by putting peak numbers from
          trials of different lengths next to each other.
        </p>
        </div>

        {/* Full container width: six columns will not fit in a prose measure,
            and squeezing them there was clipping the status column. */}
        <div className="prose-doc mt-6">
          <div className="table-scroll is-wide">
          <table>
            <thead>
              <tr>
                <th>Compound</th>
                <th>Receptors</th>
                <th>Trial</th>
                <th>Duration</th>
                <th>Mean weight change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Semaglutide 2.4 mg</td>
                <td>GLP-1</td>
                <td>STEP-1</td>
                <td>68 wk</td>
                <td>~−14.9%</td>
                <td>Approved</td>
              </tr>
              <tr>
                <td>Tirzepatide 15 mg</td>
                <td>GLP-1 + GIP</td>
                <td>SURMOUNT-1</td>
                <td>72 wk</td>
                <td>~−20.9%</td>
                <td>Approved</td>
              </tr>
              <tr>
                <td>Retatrutide 12 mg</td>
                <td>GLP-1 + GIP + glucagon</td>
                <td>Phase 2</td>
                <td>48 wk</td>
                <td>~−24.2%</td>
                <td>Investigational</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="prose-doc mt-6 max-w-2xl">
        <p>
          Read the duration column before the weight column. Retatrutide reached the largest number
          in the <em>shortest</em> time, and its phase 2 curve had not flattened at 48 weeks - which
          is the genuinely notable finding, more than the headline percentage.
        </p>
        <p>
          But efficacy is not the only axis. Semaglutide is the only one of the three with a
          cardiovascular outcomes trial showing reduced heart attacks and strokes. Tirzepatide is
          approved, prescribable and comes from a verified supply chain. Retatrutide exists only as
          grey-market material with no long-term human safety record. The trade is mostly about
          certainty, not potency.
        </p>
        </div>
      </section>
    </div>
  );
}
