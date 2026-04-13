import type { BlogPost, BreadcrumbItem, Property } from "../types";

export function generatePropertySchema(
  property: Property,
  url: string,
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url,
    image: property.photos[0] ?? "",
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.neighborhood,
      addressRegion: property.city,
    },
    offers: {
      "@type": "Offer",
      price: property.price.toString(),
      priceCurrency: "USD",
    },
    numberOfRooms: Number(property.bedrooms),
    floorSize: {
      "@type": "QuantitativeValue",
      value: Number(property.sqft),
      unitCode: "FTK",
    },
  };
  return JSON.stringify(schema);
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `https://nestfind.app${item.href}` : undefined,
    })),
  };
  return JSON.stringify(schema);
}

export function generateArticleSchema(post: BlogPost, url: string): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImageUrl,
    url,
    datePublished: post.publishedAt
      ? new Date(Number(post.publishedAt) / 1_000_000).toISOString()
      : undefined,
    dateModified: new Date(Number(post.updatedAt) / 1_000_000).toISOString(),
    author: {
      "@type": "Person",
      name: "NestFind Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "NestFind",
      logo: {
        "@type": "ImageObject",
        url: "https://nestfind.app/favicon.ico",
      },
    },
  };
  return JSON.stringify(schema);
}

export function generateOrganizationSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "NestFind",
    description:
      "Trusted real estate platform for buyers, renters, and sellers.",
    url: "https://nestfind.app",
    logo: "https://nestfind.app/favicon.ico",
  };
  return JSON.stringify(schema);
}
