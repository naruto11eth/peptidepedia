import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { SUBREDDIT_DIRECTORY } from "@/lib/reddit";

export const metadata: Metadata = {
  title: "Safety & sourcing",
  description:
    "What 'not for human consumption' actually means, how to read a certificate of analysis, and the failure modes that send people to hospital.",
};

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Reference"
        title="Safety & sourcing"
        description="The parts nobody selling you peptides has an incentive to explain."
      />

      <div className="prose-doc max-w-2xl">
        <h2>&ldquo;Not for human consumption&rdquo; is a legal position, not a finding</h2>
        <p>
          Almost every peptide sold online carries a research-use-only label. It is easy to read that
          as a formality - a wink, a liability shield. It is a liability shield. It is also an
          accurate description of what the seller has and has not done.
        </p>
        <p>
          A pharmaceutical product carries guarantees: this vial contains this molecule, at this
          purity, at this quantity, sterile, manufactured under inspected conditions, with a stability
          study behind its expiry date. <strong>Research-grade material carries none of those by
          default.</strong> Not because it is necessarily bad, but because nothing in the chain
          required anyone to verify it.
        </p>
        <p>
          The FDA has issued warning letters to peptide sellers over exactly this - marketing
          unapproved drugs to consumers while labelling them research chemicals. The label does not
          change what the product is; it changes who is liable when it goes wrong.
        </p>

        <h2>What a certificate of analysis does and does not tell you</h2>
        <p>
          A COA is the main quality signal available in this market, and it is routinely
          misunderstood. A typical peptide COA reports:
        </p>
        <ul>
          <li>
            <strong>Identity</strong> - usually by mass spectrometry. Confirms the molecular weight
            matches the intended peptide. Good evidence you have roughly the right molecule.
          </li>
          <li>
            <strong>Purity</strong> - usually by HPLC, reported as a percentage. This is peak area,
            meaning &ldquo;98% pure&rdquo; describes the proportion of detected material that is the
            target peptide. It says nothing about what the other 2% is.
          </li>
          <li>
            <strong>Net peptide content</strong> - frequently absent, and the most commonly missing
            number that matters. Lyophilised powder includes counter-ions and residual water. A vial
            can be 99% pure and still contain meaningfully less peptide than the label claims.
          </li>
        </ul>
        <p>What a standard COA generally does not cover:</p>
        <ul>
          <li>
            <strong>Sterility and endotoxin.</strong> This is the one that puts people in hospital.
            Purity testing does not detect bacterial endotoxin, and endotoxin survives sterile
            filtration. It is a separate assay, and it is rarely run.
          </li>
          <li>
            <strong>Heavy metals and residual solvents</strong> from synthesis.
          </li>
          <li>
            <strong>That this document belongs to this batch.</strong> Recycled and stale COAs are
            common. A COA with no batch number matching your vial establishes nothing at all.
          </li>
        </ul>

        <h2>How to actually evaluate a supplier</h2>
        <ul>
          <li>
            <strong>Third-party, batch-specific testing</strong> - an independent lab, a batch number
            on the report that matches the vial, and a date. Vendor-run internal testing is a
            different claim.
          </li>
          <li>
            <strong>Evidence they have failed a batch and said so.</strong> This is the strongest
            signal available. Every real testing programme produces failures; a vendor with a
            hundred-percent pass rate is either lucky, small, or not publishing everything. A supplier
            who tells you a batch failed and is out of stock is behaving correctly.
          </li>
          <li>
            <strong>Community-funded independent testing.</strong> Several peptide communities pool
            money to send vials to independent labs. This is generally more reliable than anything a
            vendor publishes, because nobody paying for it is selling the result.
          </li>
          <li>
            <strong>Consistency over time</strong>, not one impressive report.
          </li>
        </ul>

        <h2>The failure modes that actually hurt people</h2>
        <p>
          Ranked roughly by how often they cause real harm, which is not the order most people worry
          about them:
        </p>
        <ol>
          <li>
            <strong>Dosing errors.</strong> Misreading units for millilitres, or mg for mcg. An order
            of magnitude is one decimal point. This is the most common serious incident by a wide
            margin, and it is entirely preventable - which is why the{" "}
            <a href="/calculator">calculator</a> exists.
          </li>
          <li>
            <strong>Contamination and non-sterile technique.</strong> Injection-site abscesses and
            cellulitis. Reusing needles, touching the injection site after cleaning, not swabbing the
            vial stopper.
          </li>
          <li>
            <strong>Endotoxin in the product.</strong> Fever, chills and malaise a few hours after
            injecting. Frequently mistaken for a side effect of the peptide.
          </li>
          <li>
            <strong>Underlying conditions nobody looked for.</strong> Treating symptoms of an
            undiagnosed problem, and delaying the diagnosis in the process.
          </li>
          <li>
            <strong>Interactions with prescribed medication.</strong> Which your doctor cannot warn
            you about if you have not told them.
          </li>
        </ol>

        <h2>Tell your doctor</h2>
        <p>
          The most common reason people do not is expecting judgement. A clinician cannot help you
          with an interaction, an abnormal lab, or a symptom they do not know the cause of - and
          anyone competent is more interested in keeping you safe than in disapproving. If your
          doctor is not that person, find one who is, but do not solve it by withholding information.
        </p>
        <p>
          If you are using anything on this site, get baseline bloodwork first and repeat it. For
          incretins: metabolic panel, HbA1c, lipids. For anything touching the GH axis: IGF-1 and
          fasting glucose. For anything hormonal: a full male hormone panel including LH and FSH.
          Without a baseline you cannot tell a change from a coincidence.
        </p>

        <h2>Where people talk about this</h2>
        <p>
          Community discussion is genuinely useful for practical logistics and vendor reputation, and
          genuinely unreliable for anything pharmacological. Sizes below were verified against public
          listings.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Community</th>
                <th>Members</th>
                <th>Focus</th>
              </tr>
            </thead>
            <tbody>
              {SUBREDDIT_DIRECTORY.map((s) => (
                <tr key={s.name}>
                  <td>
                    <a
                      href={`https://www.reddit.com/r/${s.name}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      r/{s.name}
                    </a>
                  </td>
                  <td className="font-mono text-xs">{s.members}</td>
                  <td>{s.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Read them with the selection bias in mind. People post when something dramatic happens.
          The large silent majority for whom nothing much happened does not generate threads, so
          forums systematically overstate both benefit and harm.
        </p>
      </div>
    </div>
  );
}
