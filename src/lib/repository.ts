import type { Compound, CompoundSummary } from "./schema";

/**
 * The whole app talks to content through this interface, never through `fs`
 * directly. Swapping the filesystem for Postgres/Supabase later means writing
 * one new implementation and changing `getRepository()` - no page or component
 * touches the storage layer.
 */
export interface CompoundRepository {
  all(): Promise<Compound[]>;
  summaries(): Promise<CompoundSummary[]>;
  bySlug(slug: string): Promise<Compound | null>;
  slugs(): Promise<string[]>;
}

let cached: CompoundRepository | null = null;

export async function getRepository(): Promise<CompoundRepository> {
  if (!cached) {
    const { createFileSystemRepository } = await import("./repository.fs");
    cached = createFileSystemRepository();
  }
  return cached;
}
