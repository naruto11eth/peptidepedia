import { EVIDENCE_TIER_META, type EvidenceTier } from "@/lib/schema";

export function EvidenceBadge({
  tier,
  size = "sm",
}: {
  tier: EvidenceTier;
  size?: "sm" | "xs";
}) {
  const meta = EVIDENCE_TIER_META[tier];
  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider whitespace-nowrap ${
        size === "xs" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"
      }`}
      style={{
        color: meta.color,
        borderColor: `color-mix(in oklab, ${meta.color} 35%, transparent)`,
        background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.color }}
        aria-hidden
      />
      {meta.short}
    </span>
  );
}
