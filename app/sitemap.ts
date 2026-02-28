import type { MetadataRoute } from "next";
import { searchVerifiedMilsims } from "@/lib/milsims";
import { slugifyMilsimName } from "@/lib/slug";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bf2-milsims.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const milsims = await searchVerifiedMilsims({
    sort: "age_desc",
  });

  const now = new Date();

  return [
    // --- Core pages ---
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/milsims`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },

    // --- Static content pages ---
    {
      url: `${BASE_URL}/hall-of-fame`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },

    // --- Dynamic milsim pages ---
    ...milsims.map((m) => {
      const slug = m.slug ?? slugifyMilsimName(m.name);

      return {
        url: `${BASE_URL}/milsims/${slug}`,
        lastModified: new Date(
          m.last_checked_at ?? m.server_created_at ?? now
        ),
        changeFrequency: "daily" as const,
        priority: 0.7,
      };
    }),
  ];
}