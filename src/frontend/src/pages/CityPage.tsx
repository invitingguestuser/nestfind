import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin, Search } from "lucide-react";
import { useEffect } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { EmptyState } from "../components/EmptyState";
import { PropertyCard } from "../components/PropertyCard";
import {
  useLocationBySlug,
  useNeighborhoodsByCity,
} from "../hooks/useLocations";
import { usePropertiesByCity } from "../hooks/useProperties";
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

  const scriptId = "city-ld-schema";
  document.getElementById(scriptId)?.remove();
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = opts.schema;
  document.head.appendChild(script);
}

export default function CityPage() {
  const { slug } = useParams({ from: "/cities/$slug" });

  const { data: city, isLoading: cityLoading } = useLocationBySlug(slug);
  const { data: neighborhoods = [], isLoading: nbLoading } =
    useNeighborhoodsByCity(city?.id ?? null);
  const { data: properties = [], isLoading: propsLoading } =
    usePropertiesByCity(city?.name ?? "");

  const isLoading = cityLoading;

  useEffect(() => {
    if (!city) return;
    const title = `Properties in ${city.name} — NestFind`;
    const description = city.description
      ? city.description.slice(0, 160)
      : `Find apartments, houses, and villas for sale and rent in ${city.name}. Browse verified listings with photos, prices, and agent contacts.`;
    const canonical = `https://nestfind.app/cities/${slug}`;
    const schema = generateBreadcrumbSchema([
      { label: "Properties", href: "/search" },
      { label: city.name },
    ]);
    injectMeta({ title, description, canonical, schema });
    return () => {
      document.getElementById("city-ld-schema")?.remove();
    };
  }, [city, slug]);

  if (!isLoading && !city) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏙️</p>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          City not found
        </h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find a city matching "{slug}". It may have been renamed or
          removed.
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
      <section className="relative h-72 md:h-96 overflow-hidden bg-muted">
        {isLoading ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : (
          <>
            <img
              src={`https://picsum.photos/seed/${slug}/1200/600`}
              alt={city?.name ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/50" />
          </>
        )}
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-8">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 bg-card/30" />
              <Skeleton className="h-10 w-72 bg-card/30" />
            </div>
          ) : (
            <>
              <Breadcrumbs
                items={[
                  { label: "Properties", href: "/search" },
                  { label: city!.name },
                ]}
                injectSchema
                className="text-card/80 mb-2 [&_a]:text-card/80 [&_a:hover]:text-card [&_svg]:text-card/60"
              />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-card flex items-center gap-2">
                <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
                {city!.name}
              </h1>
            </>
          )}
        </div>
      </section>

      {/* Description */}
      {(isLoading || city?.description) && (
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {city!.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Neighborhoods */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-xl font-display font-semibold text-foreground mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            Neighborhoods in {isLoading ? "…" : city?.name}
          </h2>
          {nbLoading ? (
            <div className="flex flex-wrap gap-2">
              {(["a", "b", "c", "d", "e", "f"] as const).map((id) => (
                <Skeleton
                  key={`nb-skel-${id}`}
                  className="h-9 w-28 rounded-full"
                />
              ))}
            </div>
          ) : neighborhoods.length > 0 ? (
            <div
              className="flex flex-wrap gap-2"
              data-ocid="neighborhoods-list"
            >
              {neighborhoods.map((nb) => (
                <Link
                  key={nb.id.toString()}
                  to="/neighborhoods/$slug"
                  params={{ slug: nb.slug }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
                  data-ocid={`neighborhood-link-${nb.slug}`}
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {nb.name}
                </Link>
              ))}
            </div>
          ) : (
            !nbLoading &&
            cityLoading === false && (
              <p className="text-muted-foreground text-sm">
                No neighborhoods listed for this city yet.
              </p>
            )
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Properties in {isLoading ? "…" : city?.name}
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
                <Skeleton key={`prop-skel-${id}`} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="city-properties-grid"
            >
              {properties.map((p) => (
                <PropertyCard key={p.id.toString()} property={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="properties"
              title={`No listings in ${city?.name ?? "this city"} yet`}
              description="Be the first to list a property here, or browse all available properties."
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
              Search all properties in {city?.name ?? "this city"}
            </h3>
            <p className="text-muted-foreground text-sm">
              Use our advanced filters to narrow down by price, type, bedrooms,
              and more.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="flex-shrink-0"
            data-ocid="city-search-cta"
          >
            <Link
              to="/search"
              search={{ city: city?.name ?? "" } as Record<string, string>}
            >
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Search in {city?.name ?? "this city"}
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
