import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Search } from "lucide-react";
import { useEffect } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { EmptyState } from "../components/EmptyState";
import { PropertyCard } from "../components/PropertyCard";
import { useLocation, useLocationBySlug } from "../hooks/useLocations";
import { usePropertiesByNeighborhood } from "../hooks/useProperties";
import { generateBreadcrumbSchema } from "../lib/schema";

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

  const scriptId = "nb-ld-schema";
  document.getElementById(scriptId)?.remove();
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = opts.schema;
  document.head.appendChild(script);
}

export default function NeighborhoodPage() {
  const { slug } = useParams({ from: "/neighborhoods/$slug" });

  const { data: neighborhood, isLoading: nbLoading } = useLocationBySlug(slug);

  // Load parent city using parentId
  const { data: parentCity } = useLocation(neighborhood?.parentId ?? null);
  const cityName = parentCity?.name ?? "";
  const citySlugGuess =
    parentCity?.slug ?? cityName.toLowerCase().replace(/\s+/g, "-");

  const { data: properties = [], isLoading: propsLoading } =
    usePropertiesByNeighborhood(neighborhood?.name ?? "");

  const isLoading = nbLoading;

  useEffect(() => {
    if (!neighborhood) return;
    const title = `Properties in ${neighborhood.name}, ${cityName} — NestFind`;
    const description = neighborhood.description
      ? neighborhood.description.slice(0, 160)
      : `Explore apartments, houses, and villas for sale and rent in ${neighborhood.name}, ${cityName}. Browse verified listings near you.`;
    const canonical = `https://nestfind.app/neighborhoods/${slug}`;
    const schema = generateBreadcrumbSchema([
      { label: "Properties", href: "/search" },
      ...(cityName
        ? [{ label: cityName, href: `/cities/${citySlugGuess}` }]
        : []),
      { label: neighborhood.name },
    ]);
    injectMeta({ title, description, canonical, schema });
    return () => {
      document.getElementById("nb-ld-schema")?.remove();
    };
  }, [neighborhood, slug, cityName, citySlugGuess]);

  if (!isLoading && !neighborhood) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🗺️</p>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Neighborhood not found
        </h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find a neighborhood matching "{slug}". It may have been
          renamed or removed.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden bg-muted">
        {isLoading ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : (
          <>
            <img
              src={`https://picsum.photos/seed/nb-${slug}/1200/500`}
              alt={neighborhood?.name ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/45" />
          </>
        )}
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-8">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 bg-card/30" />
              <Skeleton className="h-10 w-80 bg-card/30" />
            </div>
          ) : (
            <>
              <Breadcrumbs
                items={[
                  { label: "Properties", href: "/search" },
                  ...(cityName
                    ? [{ label: cityName, href: `/cities/${citySlugGuess}` }]
                    : []),
                  { label: neighborhood!.name },
                ]}
                injectSchema
                className="text-card/80 mb-2 [&_a]:text-card/80 [&_a:hover]:text-card [&_svg]:text-card/60"
              />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-card flex items-center gap-2">
                <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
                {neighborhood!.name}
                {cityName && (
                  <span className="text-lg font-normal text-card/70 ml-1">
                    · {cityName}
                  </span>
                )}
              </h1>
            </>
          )}
        </div>
      </section>

      {/* Description + back link */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {neighborhood?.description && (
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {neighborhood.description}
                </p>
              )}
              {cityName && (
                <Link
                  to="/cities/$slug"
                  params={{ slug: citySlugGuess }}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline flex-shrink-0"
                  data-ocid="back-to-city-link"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  All of {cityName}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Properties */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Properties in {isLoading ? "…" : neighborhood?.name}
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
                  key={`nb-prop-skel-${id}`}
                  className="h-80 rounded-xl"
                />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="neighborhood-properties-grid"
            >
              {properties.map((p) => (
                <PropertyCard key={p.id.toString()} property={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="properties"
              title={`No listings in ${neighborhood?.name ?? "this neighborhood"} yet`}
              description="Try searching in the wider city area or browse all available properties."
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
              Search all properties in {neighborhood?.name ?? "this area"}
            </h3>
            <p className="text-muted-foreground text-sm">
              Filter by price, property type, bedrooms, and more.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="flex-shrink-0"
            data-ocid="neighborhood-search-cta"
          >
            <Link
              to="/search"
              search={
                { neighborhood: neighborhood?.name ?? "" } as Record<
                  string,
                  string
                >
              }
            >
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Search here
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
