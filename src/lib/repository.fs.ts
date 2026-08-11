import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import type { CompoundRepository } from "./repository";
import { type Compound, compoundFrontmatterSchema, toSummary } from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "compounds");

async function loadAll(): Promise<Compound[]> {
  const entries = await readdir(CONTENT_DIR);
  const files = entries.filter((f) => f.endsWith(".mdx"));

  const compounds = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
      const { data, content } = matter(raw);

      const parsed = compoundFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        // Fail the build rather than shipping a page with malformed metadata -         // the calculator and stack builder read these fields as trusted input.
        throw new Error(
          `Invalid frontmatter in content/compounds/${file}:\n${formatIssues(parsed.error.issues)}`,
        );
      }

      return { ...parsed.data, slug, body: content } satisfies Compound;
    }),
  );

  return compounds.sort((a, b) => a.name.localeCompare(b.name));
}

function formatIssues(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues.map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

export function createFileSystemRepository(): CompoundRepository {
  // Resolved once per process; Next reuses it across every page in a build.
  let pending: Promise<Compound[]> | null = null;
  const read = () => (pending ??= loadAll());

  return {
    all: read,
    async summaries() {
      return (await read()).map(toSummary);
    },
    async bySlug(slug) {
      return (await read()).find((c) => c.slug === slug) ?? null;
    },
    async slugs() {
      return (await read()).map((c) => c.slug);
    },
  };
}
