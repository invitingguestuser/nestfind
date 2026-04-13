import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useEffect } from "react";
import type { PropertyType } from "../backend";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { EmptyState } from "../components/EmptyState";
import { PropertyCard } from "../components/PropertyCard";
import { usePropertiesByType } from "../hooks/useProperties";
import { generateBreadcrumbSchema } from "../lib/schema";

// ─── Type metadata ────────────────────────────────────────────────────────────
const typeMetadata: Record<
  string,
  {
    label: string;
    heading: string;
    description: string;
    emoji: string;
    slug: string;
  }
> = {
  apartment: {
    label: "Apartments",
    heading: "Apartments for Sale and Rent",
    description:
      "Browse our curated selection of apartments — from cozy studios to spacious multi-bedroom units — available for sale and rent across top neighborhoods. Each listing is verified with up-to-date pricing and agent contacts.",
    emoji: "🏢",
    slug: "apartment",
  },
  house: {
    label: "Houses",
    heading: "Houses for Sale and Rent",
    description:
      "Explore single-family homes, townhouses, and detached houses available in your city. Find properties with gardens, garages, and family-friendly layouts — all verified and ready to view.",
    emoji: "🏡",
    slug: "house",
  },
  villa: {
    label: "Villas",
    heading: "Villas for Sale and Rent",
    description:
      "Discover luxury villas with private pools, expansive land, and premium finishes. Our villa listings include gated compounds, resort-style properties, and exclusive waterfront homes.",
    emoji: "🏰",
    slug: "villa",
  },
  studio: {
    label: "Studios",
    heading: "Studios for Sale and Rent",
    description:
      "Find compact, affordable studio apartments ideal for urban living. Perfect for individuals, students, and investors — browse studio listings with transparent pricing and virtual tours.",
    emoji: "🛋️",
    slug: "studio",
  },
  commercial: {
    label: "Commercial",
    heading: "Commercial Properties for Sale and Rent",
    description:
      "Search office spaces, retail units, warehouses, and mixed-use commercial properties. Ideal for businesses seeking to buy or lease in prime locations with high foot traffic.",
    emoji: "🏗️",
    slug: "commercial",
  },
};

const VALID_TYPES = [
  "apartment",
  "house",
  "villa",
  "studio",
  "commercial",
] as const;

function injectMeta(opts: {
  title: string;
  description: string;
  canonical: string;
  schema: string;
}) {
  document.title = opts.title;
  const setMeta = (name: string, content: string, prop?: boolean) => {
    const attr = prop ? "property" : "name";
    let el = document.querySelector(
      `meta[${attr}="${name}"]`,
    ) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  };
  setMeta("description", opts.description);
  setMeta("og:title", opts.title, true);
  setMeta("og:description", opts.description, true);
  setMeta("og:url", opts.canonical, true);
  setMeta("og:type", "website", true);

  let canonical = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = opts.canonical;

  const scriptId = "type-ld-schema";
  document.getElementById(scriptId)?.remove();
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = opts.schema;
  document.head.appendChild(script);
}

export default function PropertyTypePage() {
  const { type } = useParams({ from: "/type/$type" });
  const isValidType = (VALID_TYPES as readonly string[]).includes(type);
  const meta = typeMetadata[type];

  // PropertyType enum values match the URL param strings
  const backendType = isValidType ? (type as PropertyType) : null;

  const { data: properties = [], isLoading: propsLoading } =
    usePropertiesByType(backendType);

  useEffect(() => {
    if (!meta) return;
    const title = `${meta.heading} — NestFind`;
    const description = meta.description.slice(0, 160);
    const canonical = `https://nestfind.app/type/${type}`;
    const schema = generateBreadcrumbSchema([
      { label: "Properties", href: "/search" },
      { label: meta.label },
    ]);
    injectMeta({ title, description, canonical, schema });
    return () => {
      document.getElementById("type-ld-schema")?.remove();
    };
  }, [meta, type]);

  if (!isValidType) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏠</p>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Unknown property type
        </h1>
        <p className="text-muted-foreground mb-6">
          "{type}" is not a recognised property type.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search">Browse All</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header band */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 pt-8 pb-10">
          <Breadcrumbs
            items={[
              { label: "Properties", href: "/search" },
              { label: meta.label },
            ]}
            injectSchema
            className="mb-4"
          />
          <div className="flex items-start gap-4">
            <span
              className="text-4xl leading-none select-none"
              role="img"
              aria-label={meta.label}
            >
              {meta.emoji}
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                {meta.heading}
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {meta.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Type nav — links to other property types */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2" aria-label="Property types">
            {VALID_TYPES.map((t) => (
              <Link
                key={t}
                to="/type/$type"
                params={{ type: t }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
                  t === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary hover:text-primary"
                }`}
                data-ocid={`type-tab-${t}`}
              >
                <span role="img" aria-hidden="true">
                  {typeMetadata[t].emoji}
                </span>
                {typeMetadata[t].label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property grid */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              {meta.label} listings
              {!propsLoading && properties.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({properties.length} listing
                  {properties.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>

          {propsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(["a", "b", "c", "d", "e", "f"] as const).map((id) => (
                <Skeleton
                  key={`type-prop-skel-${id}`}
                  className="h-80 rounded-xl"
                />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="type-properties-grid"
            >
              {properties.map((p) => (
                <PropertyCard key={p.id.toString()} property={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="properties"
              title={`No ${meta.label.toLowerCase()} listed yet`}
              description="New listings are added regularly. Check back soon or explore other property types."
              ctaLabel="Browse All Properties"
              ctaHref="/search"
            />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/8 border-t border-border">
        <div className="container mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              Search all {meta.label.toLowerCase()} with advanced filters
            </h3>
            <p className="text-muted-foreground text-sm">
              Filter by city, price range, bedrooms, and amenities.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="flex-shrink-0"
            data-ocid="type-search-cta"
          >
            <Link
              to="/search"
              search={{ propertyType: type } as Record<string, string>}
            >
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Search {meta.label}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
