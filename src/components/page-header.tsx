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
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter">{title}</h1>
      {description && (
        <p className="mt-4 text-[var(--text-muted)] leading-relaxed">{description}</p>
      )}
    </header>
  );
}
