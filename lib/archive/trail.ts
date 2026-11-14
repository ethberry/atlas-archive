import { BASE_PATH } from "@/lib/site";

export type PageStep = { name: string; href?: string };

const base = () =>
  process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000${BASE_PATH}`;

// The steps of a trail as a search engine reads them.
export function trailData(steps: PageStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      ...(step.href ? { item: `${base()}${step.href}` } : {}),
    })),
  };
}

// An article on a page of the site, as a search engine reads it.
export function articleData(title: string, description: string, href: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${base()}${href}`,
    isPartOf: { "@type": "WebSite", name: "Atlas Archive", url: base() },
  };
}
