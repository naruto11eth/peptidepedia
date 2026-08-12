#!/usr/bin/env node
/**
 * Fetches and caches top Reddit threads per compound into data/reddit/.
 *
 * Reddit removed unauthenticated JSON access in 2023 — https://www.reddit.com/r/x/top.json
 * now returns 403 — so this requires OAuth credentials. Create a free app at
 * https://www.reddit.com/prefs/apps (type: "script"), then:
 *
 *   export REDDIT_CLIENT_ID=...
 *   export REDDIT_CLIENT_SECRET=...
 *   pnpm fetch:reddit                  # all compounds
 *   pnpm fetch:reddit retatrutide      # one compound
 *
 * Output is committed to the repo. The site reads the cache and never calls
 * Reddit at request time, so a missing credential degrades to "no community
 * data yet" rather than breaking the build.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "compounds");
const OUT_DIR = path.join(ROOT, "data", "reddit");

const USER_AGENT = "node:peptidepedia:0.1.0 (content cache builder)";
/** Reddit's documented OAuth budget is 100 requests/minute; we stay well under. */
const REQUEST_INTERVAL_MS = 1200;
const THREADS_PER_QUERY = 25;
const EXCERPT_CHARS = 600;

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAccessToken() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;

  if (!id || !secret) {
    fail(
      "REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required.\n" +
        "    Create a free 'script' app at https://www.reddit.com/prefs/apps and export both values.",
    );
  }

  const body = new URLSearchParams({
    grant_type: "https://oauth.reddit.com/grants/installed_client",
    device_id: "DO_NOT_TRACK_THIS_DEVICE",
  });

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body,
  });

  if (!res.ok) {
    fail(`Token request failed: ${res.status} ${res.statusText}\n    ${await res.text()}`);
  }

  const json = await res.json();
  if (!json.access_token) fail(`No access_token in response: ${JSON.stringify(json)}`);
  return json.access_token;
}

/** Minimal frontmatter reader — avoids pulling a YAML dependency into the script. */
function readFrontmatterField(source, field) {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return line ? line[1].trim() : null;
}

function parseInlineArray(raw) {
  if (!raw || raw === "[]") return [];
  const inner = raw.replace(/^\[|\]$/g, "");
  return inner
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

async function loadCompounds() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".mdx"));
  const compounds = [];

  for (const file of files) {
    const source = await readFile(path.join(CONTENT_DIR, file), "utf8");
    const slug = file.replace(/\.mdx$/, "");
    const name = readFrontmatterField(source, "name") ?? slug;
    const subreddits = parseInlineArray(readFrontmatterField(source, "subreddits"));
    const aka = parseInlineArray(readFrontmatterField(source, "aka"))
      // Parenthetical notes like "GLP-3 (misnomer)" are editorial, not search terms.
      .map((a) => a.replace(/\s*\(.*\)$/, ""))
      .filter((a) => a.length > 2);

    compounds.push({ slug, name, subreddits, searchTerms: [name, ...aka] });
  }

  return compounds.sort((a, b) => a.slug.localeCompare(b.slug));
}

let lastRequestAt = 0;

async function redditGet(url, token) {
  const wait = REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT },
  });

  if (res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset") ?? 60);
    console.warn(`      rate limited, sleeping ${reset}s`);
    await sleep((reset + 1) * 1000);
    return redditGet(url, token);
  }

  if (!res.ok) {
    console.warn(`      ${res.status} ${res.statusText} for ${url}`);
    return null;
  }

  return res.json();
}

function normaliseThread(child) {
  const d = child.data;
  const text = (d.selftext ?? "").trim();
  return {
    id: d.id,
    subreddit: d.subreddit,
    title: d.title,
    permalink: `https://www.reddit.com${d.permalink}`,
    score: d.score,
    upvoteRatio: d.upvote_ratio,
    numComments: d.num_comments,
    createdUtc: d.created_utc,
    flair: d.link_flair_text ?? null,
    excerpt: text.length > EXCERPT_CHARS ? `${text.slice(0, EXCERPT_CHARS)}…` : text,
  };
}

async function fetchCompound(compound, token) {
  const seen = new Map();

  for (const sub of compound.subreddits) {
    for (const term of compound.searchTerms) {
      const url =
        `https://oauth.reddit.com/r/${encodeURIComponent(sub)}/search` +
        `?q=${encodeURIComponent(term)}&restrict_sr=1&sort=top&t=year&limit=${THREADS_PER_QUERY}`;

      const json = await redditGet(url, token);
      const children = json?.data?.children ?? [];
      for (const child of children) {
        if (child.kind !== "t3") continue;
        const thread = normaliseThread(child);
        // Same thread can match several search terms; keep one copy.
        if (!seen.has(thread.id)) seen.set(thread.id, thread);
      }
      console.log(`      r/${sub} "${term}" → ${children.length}`);
    }
  }

  const threads = [...seen.values()].sort((a, b) => b.score - a.score);

  return {
    slug: compound.slug,
    name: compound.name,
    subreddits: compound.subreddits,
    searchTerms: compound.searchTerms,
    fetchedAt: new Date().toISOString(),
    threadCount: threads.length,
    threads,
  };
}

async function main() {
  const filter = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const all = await loadCompounds();
  const targets = filter.length ? all.filter((c) => filter.includes(c.slug)) : all;

  if (!targets.length) {
    fail(`No matching compounds. Available: ${all.map((c) => c.slug).join(", ")}`);
  }

  const withSubs = targets.filter((c) => c.subreddits.length > 0);
  if (!withSubs.length) {
    fail("None of the selected compounds declare `subreddits` in their frontmatter.");
  }

  console.log(`\n  Authenticating with Reddit…`);
  const token = await getAccessToken();
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const compound of withSubs) {
    console.log(`\n  ${compound.name}`);
    const result = await fetchCompound(compound, token);
    await writeFile(
      path.join(OUT_DIR, `${compound.slug}.json`),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    manifest.push({
      slug: result.slug,
      threadCount: result.threadCount,
      fetchedAt: result.fetchedAt,
    });
    console.log(`    → ${result.threadCount} unique threads cached`);
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), compounds: manifest }, null, 2)}\n`,
  );

  const total = manifest.reduce((sum, m) => sum + m.threadCount, 0);
  console.log(`\n  ✓ ${total} threads across ${manifest.length} compounds → data/reddit/\n`);
}

main().catch((error) => fail(error?.stack ?? String(error)));
