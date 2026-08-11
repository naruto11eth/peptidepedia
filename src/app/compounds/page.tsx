import type { Metadata } from "next";

import { CompoundBrowser } from "@/components/compound-browser";
import { PageHeader } from "@/components/page-header";
import { getRepository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Compounds",
  description:
    "Every compound in the reference, filterable by goal and by the strength of its human evidence.",
};

export default async function CompoundsPage() {
  const repo = await getRepository();
  const compounds = await repo.summaries();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow={`${compounds.length} compounds`}
        title="The index"
        description="Sorted by strength of human evidence by default. Filter by what you are trying to achieve, or search by brand name, alias, or research code."
      />
      <CompoundBrowser compounds={compounds} />
    </div>
  );
}
