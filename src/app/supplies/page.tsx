import type { Metadata } from "next";
import Link from "next/link";

import { ArticleLayout, type ArticleSection } from "@/components/article-layout";

export const metadata: Metadata = {
  title: "Supplies",
  description:
    "Bacteriostatic water, syringes, alcohol pads, sharps disposal and storage - the equipment side, explained once.",
};

const SECTIONS: readonly ArticleSection[] = [
  { id: "bacteriostatic-water", label: "Bacteriostatic water" },
  { id: "syringes", label: "Syringes" },
  { id: "rest-of-the-kit", label: "The rest of the kit" },
  { id: "storage", label: "Storage" },
  { id: "injection-technique", label: "Injection technique" },
];

export default function SuppliesPage() {
  return (
    <ArticleLayout
      eyebrow="Reference"
      title="Supplies"
      description={"The unglamorous half. Most avoidable problems are equipment and technique problems, not pharmacology problems."}
      sections={SECTIONS}
    >
        <h2 id="bacteriostatic-water">Bacteriostatic water - not sterile water</h2>
        <p>
          These are different products and the difference matters. <strong>Bacteriostatic water</strong>{" "}
          contains 0.9% benzyl alcohol, a preservative that inhibits bacterial growth, which is what
          lets a multi-dose vial survive repeated needle entries over weeks.{" "}
          <strong>Sterile water</strong> has no preservative - it is sterile until the first needle
          goes in, and then it is a nutrient broth at room temperature.
        </p>
        <p>
          Use bacteriostatic water for anything you will draw from more than once. Sterile water is
          for single-use reconstitution only.
        </p>
        <p>
          The exception worth knowing: benzyl alcohol is contraindicated in neonates, and some people
          are genuinely sensitive to it. It is also why bacteriostatic water is not used for
          large-volume administration.
        </p>

        <h2 id="syringes">Syringes</h2>
        <p>
          For subcutaneous peptide injection, insulin syringes with a fixed needle are the standard
          choice - the fixed needle means no dead space, so you are not leaving a measurable fraction
          of a small dose behind in the hub.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Spec</th>
                <th>Typical choice</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gauge</td>
                <td>29-31G</td>
                <td>Higher number is thinner. 31G is nearly painless; below 29G is unnecessary for a watery solution.</td>
              </tr>
              <tr>
                <td>Length</td>
                <td>5/16&Prime; (8 mm) or 1/2&Prime; (12.7 mm)</td>
                <td>Subcutaneous tissue is shallow. Shorter is fine and reduces the chance of hitting muscle.</td>
              </tr>
              <tr>
                <td>Barrel</td>
                <td>0.3 mL (30 u) or 0.5 mL (50 u)</td>
                <td>Smaller barrels have wider-spaced graduations, so small doses are easier to read accurately.</td>
              </tr>
              <tr>
                <td>Reconstituting</td>
                <td>1 mL syringe, or a larger-gauge draw needle</td>
                <td>Pushing 2 mL of water through a 31G needle is slow and bends the needle.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>One needle, one use.</strong> Needles are siliconised and sharpened for a single
          insertion; a second use is measurably blunter and drags tissue. They cost cents.
        </p>

        <h2 id="rest-of-the-kit">The rest of the kit</h2>
        <ul>
          <li>
            <strong>Alcohol prep pads (70% isopropyl).</strong> Two per injection: one for the vial
            stopper, one for the skin. Let the skin dry before injecting - alcohol stings when it is
            carried under the surface, and it has not finished working while it is still wet.
          </li>
          <li>
            <strong>A sharps container.</strong> A rigid, puncture-proof container with a lid. Not a
            bottle, not a coffee can. Most pharmacies and many municipalities take full ones back.
            This is the step people skip, and needles in household rubbish injure sanitation workers.
          </li>
          <li>
            <strong>Refrigerator space, with a thermometer.</strong> 2-8 °C. Fridge doors swing much
            wider than that.
          </li>
          <li>
            <strong>A log.</strong> Date, compound, dose, site, and anything you noticed. Without it
            you cannot attribute an effect to a cause, and after three months you will not remember.
          </li>
        </ul>

        <h2 id="storage">Storage, honestly</h2>
        <ul>
          <li>
            <strong>Lyophilised powder is robust.</strong> This is why peptides survive shipping
            without cold packs. Sealed and dry, most tolerate room temperature for weeks.
          </li>
          <li>
            <strong>Reconstituted solution is not.</strong> Refrigerate immediately, and work on
            roughly a four-week window unless the compound says otherwise.
          </li>
          <li>
            <strong>Do not freeze reconstituted peptide.</strong> Ice crystal formation and the
            freeze-thaw cycle degrade peptides. Freezing is for long-term storage of powder, not
            solution.
          </li>
          <li>
            <strong>Protect from light</strong> and avoid shaking. Swirl gently; aim the water stream
            at the vial wall rather than directly onto the powder cake.
          </li>
          <li>
            <strong>Cloudiness, particulates, or a colour change means discard.</strong> Clear
            solutions should stay clear. The one exception is{" "}
            <Link href="/compounds/ghk-cu">GHK-Cu</Link>, which is deep blue by nature - a colourless
            GHK-Cu solution is the anomaly there.
          </li>
        </ul>

        <h2 id="injection-technique">Injection technique, briefly</h2>
        <ol>
          <li>Wash hands. Swab the vial stopper and let it dry.</li>
          <li>Draw the dose. Tap out air bubbles and expel them - with subcutaneous injection a small bubble is not dangerous, but it displaces volume and costs you dose accuracy.</li>
          <li>Swab the site and let it dry fully.</li>
          <li>Pinch the skin, insert at 45-90° depending on needle length and body fat, inject slowly.</li>
          <li>Withdraw, apply light pressure. Do not rub.</li>
          <li>Needle straight into the sharps container. Never recap.</li>
        </ol>
        <p>
          <strong>Rotate sites.</strong> Abdomen (avoiding a two-inch radius around the navel), outer
          thigh, upper outer buttock, back of the arm. Repeatedly injecting the same spot causes
          lipohypertrophy - lumpy, fibrous tissue that absorbs unpredictably, which quietly makes
          your dosing inconsistent long before it looks like anything.
        </p>

        <div
          className="not-prose surface p-5 my-8"
          style={{ borderColor: "color-mix(in oklab, var(--color-tier-preclinical) 35%, transparent)" }}
        >
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text)]">On buying.</strong> This site does not recommend
            vendors, and any list of them would be out of date within a quarter - suppliers change
            hands, batches vary, and today&rsquo;s well-regarded source is next year&rsquo;s
            cautionary thread. What holds is the evaluation method rather than the names. See{" "}
            <Link href="/safety" className="text-[var(--color-accent)] underline underline-offset-2">
              safety &amp; sourcing
            </Link>{" "}
            for how to read a certificate of analysis and what independent testing actually
            establishes.
          </p>
        </div>
    </ArticleLayout>
  );
}
