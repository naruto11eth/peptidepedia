import type { MetadataRoute } from "next";

import { getRepository } from "@/lib/repository";

const STATIC_ROUTES = [
  "",
  "/compounds",
  "/compare",
  "/calculator",
  "/stack",
  "/safety",
  "/supplies",
  "/methodology",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepository();
  const compounds = await repo.summaries();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    // Compound pages carry a reviewed date, so lastModified is real rather than build time.
    ...compounds.map((c) => ({
      url: `${base}/compounds/${c.slug}`,
      lastModified: new Date(c.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
