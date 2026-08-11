import type { MDXComponents } from "mdx/types";
import Link from "next/link";

function slugify(children: React.ReactNode): string {
  return String(children)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => <h2 id={slugify(children)}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(children)}>{children}</h3>,
  // Comparison tables carry most of this site's data and routinely overflow on
  // phones; each one gets its own horizontal scroll container so the page body
  // never scrolls sideways.
  table: ({ children }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) => {
    const url = String(href ?? "");
    if (url.startsWith("/")) {
      return <Link href={url as never}>{children}</Link>;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};
