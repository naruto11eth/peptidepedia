import type { Metadata } from "next";

import { EvidenceBadge } from "@/components/evidence-badge";
import { ArticleLayout, type ArticleSection } from "@/components/article-layout";
import { EVIDENCE_TIERS, EVIDENCE_TIER_META } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How evidence tiers are assigned, where dosing figures come from, and what this site refuses to do.",
};

const SECTIONS: readonly ArticleSection[] = [
  { id: "tier-describes-the-use", label: "The tier describes the use" },
  { id: "where-doses-come-from", label: "Where dosing figures come from" },
  { id: "what-this-site-will-not-do", label: "What this site will not do" },
  { id: "corrections", label: "Corrections" },
];

export default function MethodologyPage() {
  return (
    <ArticleLayout
      eyebrow="About"
      title="Methodology"
      description="How to read this site, and what its labels mean."
      sections={SECTIONS}
    >
      <section className="not-prose mb-10 grid gap-3 sm:grid-cols-2">
          {EVIDENCE_TIERS.map((tier) => {
            const meta = EVIDENCE_TIER_META[tier];
            return (
              <div key={tier} className="surface p-5">
                <div className="mb-2.5">
                  <EvidenceBadge tier={tier} />
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{meta.description}</p>
              </div>
            );
          })}
      </section>
          <h2 id="tier-describes-the-use">The tier describes the use, not the molecule</h2>
          <p>
            This is the distinction that makes the tiers useful rather than decorative. A compound is
            rated on the evidence for <em>what people take it for</em>, not on whether any research
            exists.
          </p>
          <p>
            BPC-157 has well over a hundred published papers. It is rated{" "}
            <strong>preclinical</strong>, because none of them is a completed randomised controlled
            trial in humans. GHK-Cu has decades of topical trials and is still rated preclinical,
            because the injectable route people are buying has no trials behind it. Tesamorelin is{" "}
            <strong>approved</strong> - for HIV-associated lipodystrophy, which is not why most
            readers arrive at its page, and the page says so.
          </p>

          <h2 id="where-doses-come-from">Where dosing figures come from</h2>
          <p>
            Every dose on this site is labelled by origin, and the two categories are not
            interchangeable:
          </p>
          <ul>
            <li>
              <strong>Trial doses</strong> - what was actually administered in a published study,
              cited. Retatrutide&rsquo;s 1-12 mg range is this.
            </li>
            <li>
              <strong>Reported practice</strong> - what users and vendors converge on, with no
              dose-finding study behind it. Ipamorelin&rsquo;s 200-300 mcg is this. It is recorded
              because you will encounter it, and knowing that it is convention rather than evidence is
              more useful than not knowing the number.
            </li>
          </ul>
          <p>
            Neither is a recommendation. Where a figure has no study behind it, the page says so in
            the same sentence as the number rather than in a footnote.
          </p>

          <h2 id="what-this-site-will-not-do">What this site will not do</h2>
          <ul>
            <li>
              <strong>Recommend vendors.</strong> Any list would be stale within months, and a
              reference that also directs traffic to sellers has an interest in what it concludes.
            </li>
            <li>
              <strong>Fabricate community sentiment.</strong> Reddit removed unauthenticated API
              access, so community sections are populated by a script run against real threads with
              real permalinks. Where that cache is empty, the section says it is empty. Inventing
              plausible-sounding quotes would be indistinguishable from the vendor copy this site
              exists to be an alternative to.
            </li>
            <li>
              <strong>Round a preclinical compound up.</strong> Encouraging language about a
              compound with no human trials is the most common failure mode in this space, and it is
              usually done by describing mouse results in the passive voice until they sound like
              human ones.
            </li>
            <li>
              <strong>Pretend the legal position is settled when it is not.</strong> Regulatory status
              is stated per compound with a date, because it changes.
            </li>
          </ul>

          <h2 id="corrections">Corrections</h2>
          <p>
            Every compound page carries a last-reviewed date. Trials read out, approvals land, and
            bulk-substance lists change - a page that has not been touched in a year should be treated
            as a year old. If something here is wrong, it is worth more to this site to fix it than to
            have been right.
          </p>
    </ArticleLayout>
  );
}
