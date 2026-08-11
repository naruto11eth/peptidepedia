import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        <div className="surface p-5 sm:p-6">
          <p className="label-xs mb-3">Read this first</p>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Peptidepedia is a reference, not medical advice, and nothing here is a recommendation to
            take anything. Most compounds documented on this site are{" "}
            <strong className="text-[var(--text)]">not approved for human use</strong> and are sold
            labelled &ldquo;for research purposes only, not for human consumption.&rdquo; That label
            is a legal position, not a safety finding - it means no regulator has verified the
            identity, purity, sterility, or dose of what is in the vial. Dosing figures are recorded
            as <em>what trials tested or what users report</em>, never as instructions. Talk to a
            clinician who knows your history before starting or stopping anything.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold tracking-tight">Peptidepedia</p>
            <p className="text-sm text-[var(--text-faint)]">
              Evidence-tiered. Cited. Updated when the data changes.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-muted)]">
            <Link href="/compounds" className="hover:text-[var(--text)]">
              Compounds
            </Link>
            <Link href="/compare" className="hover:text-[var(--text)]">
              Compare
            </Link>
            <Link href="/calculator" className="hover:text-[var(--text)]">
              Calculator
            </Link>
            <Link href="/safety" className="hover:text-[var(--text)]">
              Safety &amp; sourcing
            </Link>
            <Link href="/methodology" className="hover:text-[var(--text)]">
              Methodology
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
