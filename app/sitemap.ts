import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const date = new Date();
  return [
    {
      url: process.env.NEXT_PUBLIC_BASE_URL,
      lastModified: date,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service`,
      lastModified: date,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/saft`,
      lastModified: date,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
      lastModified: date,
      changeFrequency: "monthly",
      priority: 0.1,
    },
  ];
}
