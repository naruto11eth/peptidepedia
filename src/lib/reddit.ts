import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "data", "reddit");

export interface RedditThread {
  id: string;
  subreddit: string;
  title: string;
  permalink: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdUtc: number;
  flair: string | null;
  excerpt: string;
}

export interface RedditCache {
  slug: string;
  name: string;
  subreddits: string[];
  searchTerms: string[];
  fetchedAt: string;
  threadCount: number;
  threads: RedditThread[];
}

/**
 * Returns null when the cache has not been populated. Every consumer must
 * handle that - the repo ships without Reddit data because fetching it
 * requires the operator's own API credentials.
 */
export async function getRedditCache(slug: string): Promise<RedditCache | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as RedditCache;
  } catch {
    return null;
  }
}

/** Directory of communities, with sizes verified against public listings. */
export const SUBREDDIT_DIRECTORY: {
  name: string;
  members: string;
  focus: string;
}[] = [
  { name: "Biohackers", members: "884K", focus: "Broad self-experimentation; peptides are one thread among many" },
  { name: "Semaglutide", members: "201K", focus: "FDA-approved semaglutide only - compounded discussion is removed" },
  { name: "Mounjaro", members: "200K", focus: "Prescription tirzepatide: Mounjaro and Zepbound experiences" },
  { name: "tirzepatidecompound", members: "186K", focus: "The largest tirzepatide community, compounded and grey-market included" },
  { name: "Peptidesource", members: "104K", focus: "Long-running peptide research and sourcing discussion" },
  { name: "PeptideForum", members: "52K", focus: "General peptide education and experience reports" },
  { name: "GLP1", members: "38K", focus: "All GLP-1 agonists, cross-brand" },
];
