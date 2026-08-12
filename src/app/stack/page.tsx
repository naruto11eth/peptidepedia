import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { StackBuilder } from "@/components/stack-builder";
import { getRepository } from "@/lib/repository";
import { decodeStack } from "@/lib/stack";

export const metadata: Metadata = {
  title: "Stack builder",
  description:
    "Pick goals, arrange compounds onto a week, and see which selections have overlapping mechanisms.",
};

export default async function StackPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const repo = await getRepository();
  const compounds = await repo.summaries();

  // Shared links are resolved on the server so a stack sent to someone else
  // renders in the initial HTML instead of appearing after hydration.
  const { s } = await searchParams;
  const sharedStack = decodeStack(s ?? null, new Set(compounds.map((c) => c.slug)));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Tool"
        title="Stack builder"
        description="A scheduling aid. It turns a list of compounds into a weekly grid and flags mechanical overlaps - it does not decide whether any of it is a good idea."
      />
      <StackBuilder compounds={compounds} sharedStack={sharedStack} />
    </div>
  );
}
