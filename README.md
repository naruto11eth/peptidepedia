# Peptidepedia

An evidence-tiered reference for peptides and related compounds. Static Next.js site, content in MDX, no database.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm typecheck
pnpm lint
```

## How it's put together

```
content/compounds/*.mdx     one file per compound — frontmatter + prose
src/lib/schema.ts           Zod schema for that frontmatter; the site's data contract
src/lib/repository.ts       storage interface every page reads through
src/lib/repository.fs.ts    filesystem implementation
src/lib/reconstitution.ts   dose → syringe unit maths (pure)
src/lib/stack.ts            cadence → weekly schedule, conflict detection
scripts/fetch-reddit.mjs    build-time Reddit cache builder
data/reddit/*.json          cached threads (generated, committed)
```

Frontmatter is validated at build time. A malformed field **fails the build** rather than shipping a page — the calculator and stack builder consume those values as trusted input, so a silent default would produce confidently wrong arithmetic.

## Adding a compound

Drop a new `.mdx` file in `content/compounds/`. The filename becomes the slug. Everything else — the index, search, compare, calculator options, stack builder, static route generation — picks it up automatically. Copy an existing file for the frontmatter shape; `src/lib/schema.ts` is the authority on what's required.

Evidence tiers describe the strength of human evidence **for the use people actually take the compound for**, not whether research exists at all. See `/methodology`.

## Reddit community sections

Reddit removed unauthenticated JSON API access in 2023, so this needs your own credentials. Create a free app at <https://www.reddit.com/prefs/apps> (type: **script**), then:

```bash
export REDDIT_CLIENT_ID=...
export REDDIT_CLIENT_SECRET=...
pnpm fetch:reddit                # every compound with a `subreddits` field
pnpm fetch:reddit retatrutide    # just one
```

Output lands in `data/reddit/` and should be committed. The site reads the cache and never calls Reddit at request time. **Without the cache, community sections render an explicit empty state** — no placeholder quotes, by design.

## Swapping in a backend

Pages never touch `fs`. They call `getRepository()`, which returns a `CompoundRepository`. To move to Postgres/Supabase, write a second implementation of that interface and change the one dynamic import in `src/lib/repository.ts`. No page or component changes.

## Notes on hosting

`/calculator` and `/stack` read `searchParams` (for `?compound=` and shareable `?s=` stack links), so they render on demand rather than at build time. Everything else is fully static. If you need a pure static export, those two params would have to move client-side.

## Editorial

- Dosing figures are labelled by origin: trial doses cite the trial; reported practice says it's convention with no dose-finding study behind it.
- No vendor recommendations. Any list goes stale in a quarter, and a reference that routes traffic to sellers has an interest in its own conclusions.
- Every compound page carries a last-reviewed date. Regulatory status changes.
