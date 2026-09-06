import { PageHeader } from "@/components/page-header";

export interface ArticleSection {
  id: string;
  label: string;
}

/**
 * Long-form reference pages were a narrow column pinned to the left of a wide
 * container, leaving half the viewport empty. The right rail now carries a
 * sticky contents list, which fills the space with navigation rather than
 * decoration and matches the two-column shape compound pages already use.
 */
export function ArticleLayout({
  eyebrow,
  title,
  description,
  sections,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  sections: readonly ArticleSection[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-14">
        <div className="prose-doc min-w-0">{children}</div>

        {sections.length > 0 && (
          <nav
            aria-label="On this page"
            className="order-first lg:order-none lg:sticky lg:top-20"
          >
            <p className="label-xs mb-3">On this page</p>
            <ul className="flex flex-col gap-2.5 border-l pl-4">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm leading-snug text-[var(--text-muted)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
