import type { RedditCache } from "@/lib/reddit";

/**
 * Renders cached Reddit threads, or an explicit empty state when the cache has
 * not been built. The empty state is deliberate: fabricating community
 * sentiment would be worse than showing none, so the section says plainly that
 * no data has been fetched rather than filling space with invented quotes.
 */
export function CommunitySection({
  cache,
  subreddits,
}: {
  cache: RedditCache | null;
  subreddits: string[];
}) {
  if (!subreddits.length) return null;

  const threads = cache?.threads.slice(0, 8) ?? [];

  return (
    <section>
      <h2 id="from-the-community">From the community</h2>

      <p>
        Discussion for this compound concentrates in{" "}
        {subreddits.map((s, i) => (
          <span key={s}>
            {i > 0 && (i === subreddits.length - 1 ? " and " : ", ")}
            <a href={`https://www.reddit.com/r/${s}/`} target="_blank" rel="noopener noreferrer">
              r/{s}
            </a>
          </span>
        ))}
        .
      </p>

      {threads.length === 0 ? (
        <div className="not-prose surface p-5 text-sm text-[var(--text-muted)] leading-relaxed space-y-2">
          <p className="text-[var(--text)] font-medium">No threads cached yet.</p>
          <p>
            Reddit removed unauthenticated API access, so this section is populated by a build-time
            script using your own API credentials. Run{" "}
            <code className="font-mono text-xs bg-[var(--bg-raised)] border rounded px-1.5 py-0.5">
              pnpm fetch:reddit {cache?.slug ?? ""}
            </code>{" "}
            with <code className="font-mono text-xs">REDDIT_CLIENT_ID</code> and{" "}
            <code className="font-mono text-xs">REDDIT_CLIENT_SECRET</code> set.
          </p>
        </div>
      ) : (
        <>
          <div className="not-prose space-y-2 my-6">
            {threads.map((t) => (
              <a
                key={t.id}
                href={t.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="surface p-4 block hover:border-[var(--border-strong)] transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium group-hover:text-[var(--color-accent)] transition-colors">
                    {t.title}
                  </p>
                  <span className="label-xs shrink-0 tabular-nums">↑ {t.score}</span>
                </div>
                {t.excerpt && (
                  <p className="text-xs text-[var(--text-faint)] mt-2 leading-relaxed line-clamp-3">
                    {t.excerpt}
                  </p>
                )}
                <p className="label-xs mt-2.5">
                  r/{t.subreddit} · {t.numComments} comments
                </p>
              </a>
            ))}
          </div>
          <p className="text-xs text-[var(--text-faint)]">
            Cached {cache ? new Date(cache.fetchedAt).toISOString().slice(0, 10) : " - "}. Community
            reports are self-selected and unverified - people who have a dramatic experience post
            about it, and people for whom nothing happened mostly do not.
          </p>
        </>
      )}
    </section>
  );
}
