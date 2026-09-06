export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 max-w-2xl">
      {eyebrow && <p className="label-xs mb-3">{eyebrow}</p>}
      <h1 className="display text-3xl sm:text-5xl text-[var(--color-powder)]">{title}</h1>
      {description && (
        <p className="mt-4 text-[var(--text-muted)] leading-relaxed">{description}</p>
      )}
    </header>
  );
}
