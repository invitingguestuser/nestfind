import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Globe,
  Home,
  MapPin,
  Search,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";
import { PropertyCardSkeleton } from "../components/LoadingSpinner";
import { PropertyCard } from "../components/PropertyCard";
import { SearchBar } from "../components/SearchBar";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useLocations } from "../hooks/useLocations";
import { useFeaturedProperties } from "../hooks/useProperties";
import type { BlogPost, Location, Property } from "../types";

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "10,000+", label: "Verified Listings", icon: Building2 },
  { value: "50+", label: "Cities Covered", icon: Globe },
  { value: "3,200+", label: "Trusted Agents", icon: Users },
  { value: "99%", label: "Satisfaction Rate", icon: Award },
];

// ─── Property Types ───────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  {
    type: "apartment",
    label: "Apartments",
    icon: Building2,
    description: "Urban living in prime locations",
    count: "4,200+",
  },
  {
    type: "house",
    label: "Houses",
    icon: Home,
    description: "Spacious family homes",
    count: "2,800+",
  },
  {
    type: "villa",
    label: "Villas",
    icon: Award,
    description: "Luxury properties & estates",
    count: "680+",
  },
  {
    type: "studio",
    label: "Studios",
    icon: MapPin,
    description: "Compact & efficient spaces",
    count: "1,500+",
  },
  {
    type: "commercial",
    label: "Commercial",
    icon: Globe,
    description: "Office & retail spaces",
    count: "920+",
  },
];

// ─── Trust Signals ────────────────────────────────────────────────────────────
const TRUST_FEATURES = [
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "Every property is reviewed and verified by our team with freshness dates and source labels so you always have current, trustworthy data.",
  },
  {
    icon: Users,
    title: "Expert Agents",
    description:
      "Connect with licensed professionals who know their markets inside out. Our agents are vetted and rated by real buyers and renters.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Use natural language to describe your dream home. Our AI-powered search filters by location, budget, amenities, and more in seconds.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Browse, save, and compare properties on any device. Our fully responsive interface keeps your search seamless wherever you are.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, icon: Icon }: (typeof STATS)[number]) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 mb-1">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function CityCard({ location }: { location: Location }) {
  return (
    <Link
      to="/cities/$slug"
      params={{ slug: location.slug }}
      data-ocid={`city-card-${location.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="relative h-36 overflow-hidden bg-muted">
        {location.featuredImageUrl ? (
          <img
            src={location.featuredImageUrl}
            alt={location.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPin className="h-8 w-8 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display font-semibold text-card text-sm leading-tight">
            {location.name}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-xs text-muted-foreground line-clamp-1">
          {location.description || "Explore properties"}
        </p>
        <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 ml-1" />
      </div>
    </Link>
  );
}

function PropertyTypeCard({
  type,
  label,
  icon: Icon,
  description,
  count,
}: (typeof PROPERTY_TYPES)[number]) {
  return (
    <Link
      to="/type/$type"
      params={{ type }}
      data-ocid={`type-card-${type}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-0.5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-display font-semibold text-foreground text-sm">
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="text-xs font-mono bg-muted text-muted-foreground mt-auto"
      >
        {count}
      </Badge>
    </Link>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      data-ocid={`blog-card-${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen className="h-8 w-8 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground text-xs capitalize">
            {post.category}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Calendar
            className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">
            {post.publishedAt
              ? new Date(
                  Number(post.publishedAt) / 1_000_000,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent"}
          </span>
          <span className="ml-auto text-xs text-primary font-medium flex items-center gap-0.5">
            Read more <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Section skeleton helpers ─────────────────────────────────────────────────

function CitySkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: featuredProperties, isLoading: propertiesLoading } =
    useFeaturedProperties();
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data: blogPosts, isLoading: blogLoading } = useBlogPosts(null, true);

  const cities = (locations ?? [])
    .filter((l) => l.locationType === "city")
    .slice(0, 8);

  const recentPosts = (blogPosts ?? []).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[88vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-city-skyline.dim_1600x800.jpg"
            alt=""
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/50 to-foreground/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <Badge
            className="mb-5 bg-primary/90 text-primary-foreground border-0 text-xs tracking-wide uppercase font-medium px-4 py-1"
            data-ocid="hero-badge"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Verified Listings · Trusted Agents
          </Badge>

          <h1 className="font-display font-bold text-card text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-4 drop-shadow-lg">
            Find Your
            <span className="block text-primary">Perfect Home</span>
          </h1>

          <p className="text-card/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-body leading-relaxed drop-shadow">
            Search thousands of verified properties across 50+ cities. Buy,
            rent, or sell — all in one trusted platform.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto" data-ocid="hero-search-bar">
            <SearchBar variant="hero" />
          </div>

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-card/60">Popular:</span>
            {[
              { label: "NYC Apartments", city: "New York" },
              { label: "Miami Houses", city: "Miami" },
              { label: "LA Villas", city: "Los Angeles" },
              { label: "Chicago Studios", city: "Chicago" },
            ].map(({ label, city }) => (
              <Link
                key={label}
                to="/search"
                search={{ keyword: "", city, propertyType: "" }}
                className="rounded-full border border-card/30 bg-card/10 px-3 py-1 text-card/80 hover:bg-card/20 transition-colors backdrop-blur-sm"
                data-ocid={`popular-search-${city.toLowerCase().replace(/\s/g, "-")}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade to page background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-card border-y border-border"
        aria-label="Platform stats"
      >
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ────────────────────────────────────────────── */}
      <section
        className="bg-background py-16"
        aria-labelledby="featured-heading"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
                Hand-picked for you
              </p>
              <h2
                id="featured-heading"
                className="font-display font-bold text-foreground text-3xl sm:text-4xl"
              >
                Featured Properties
              </h2>
            </div>
            <Link to="/search" data-ocid="featured-view-all-btn">
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {propertiesLoading ? (
            <div className="property-grid">
              {["p1", "p2", "p3", "p4", "p5", "p6"].map((k) => (
                <PropertyCardSkeleton key={k} />
              ))}
            </div>
          ) : featuredProperties && featuredProperties.length > 0 ? (
            <div className="property-grid">
              {featuredProperties.map((property: Property) => (
                <PropertyCard
                  key={property.id.toString()}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-xl border border-border bg-muted/30"
              data-ocid="featured-empty-state"
            >
              <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-display font-semibold text-foreground mb-1">
                No featured listings yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to submit a property
              </p>
              <Link to="/submit-listing">
                <Button size="sm">List Your Property</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Browse by City ─────────────────────────────────────────────────── */}
      <section
        className="bg-muted/40 border-y border-border py-16"
        aria-labelledby="cities-heading"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
                Explore locations
              </p>
              <h2
                id="cities-heading"
                className="font-display font-bold text-foreground text-3xl sm:text-4xl"
              >
                Browse by City
              </h2>
            </div>
          </div>

          {locationsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((k) => (
                <CitySkeleton key={k} />
              ))}
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cities.map((location: Location) => (
                <CityCard key={location.id.toString()} location={location} />
              ))}
            </div>
          ) : (
            // Fallback hardcoded cities so page never looks empty
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                {
                  name: "New York",
                  slug: "new-york",
                  desc: "The city that never sleeps",
                },
                {
                  name: "Los Angeles",
                  slug: "los-angeles",
                  desc: "Sun, surf & skyline",
                },
                {
                  name: "Miami",
                  slug: "miami",
                  desc: "Waterfront luxury living",
                },
                {
                  name: "Chicago",
                  slug: "chicago",
                  desc: "Architecture & culture",
                },
                {
                  name: "Houston",
                  slug: "houston",
                  desc: "Space City opportunities",
                },
                {
                  name: "Austin",
                  slug: "austin",
                  desc: "Tech hub & live music",
                },
                {
                  name: "Seattle",
                  slug: "seattle",
                  desc: "Innovation & scenic views",
                },
                {
                  name: "Boston",
                  slug: "boston",
                  desc: "History meets modernity",
                },
              ].map(({ name, slug, desc }) => (
                <Link
                  key={slug}
                  to="/cities/$slug"
                  params={{ slug }}
                  data-ocid={`city-fallback-${slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
                >
                  <div className="h-36 flex items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10">
                    <MapPin className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-foreground text-sm">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {desc}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Browse by Property Type ────────────────────────────────────────── */}
      <section className="bg-background py-16" aria-labelledby="types-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
              What are you looking for?
            </p>
            <h2
              id="types-heading"
              className="font-display font-bold text-foreground text-3xl sm:text-4xl"
            >
              Browse by Property Type
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PROPERTY_TYPES.map((pt) => (
              <PropertyTypeCard key={pt.type} {...pt} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why NestFind ──────────────────────────────────────────────────── */}
      <section
        className="bg-muted/40 border-y border-border py-16"
        aria-labelledby="trust-heading"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
              Why thousands choose us
            </p>
            <h2
              id="trust-heading"
              className="font-display font-bold text-foreground text-3xl sm:text-4xl"
            >
              Why NestFind?
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              We combine verified data, expert guidance, and smart technology to
              make your property search seamless and trustworthy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-start gap-3 rounded-xl bg-card border border-border p-5 transition-shadow duration-200 hover:shadow-elevated"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Blog Posts ─────────────────────────────────────────────── */}
      <section className="bg-background py-16" aria-labelledby="blog-heading">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
                Market insights
              </p>
              <h2
                id="blog-heading"
                className="font-display font-bold text-foreground text-3xl sm:text-4xl"
              >
                Latest from the Blog
              </h2>
            </div>
            <Link to="/blog" data-ocid="blog-view-all-btn">
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5"
              >
                All articles <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {blogLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["b1", "b2", "b3"].map((k) => (
                <BlogSkeleton key={k} />
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post: BlogPost) => (
                <BlogPostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          ) : (
            // Fallback sample blog posts for launch day
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  slug: "buyers-guide-2026",
                  title: "The Complete Buyer's Guide for 2026",
                  excerpt:
                    "Everything first-time buyers need to know — from mortgage pre-approval to closing day. A step-by-step walkthrough of the modern home-buying process.",
                  category: "buying",
                  date: "Jan 15, 2026",
                },
                {
                  slug: "top-rental-markets",
                  title: "Top 10 Rental Markets to Watch This Year",
                  excerpt:
                    "Rental demand is shifting. We analyze data from 50 cities to identify where renters are moving and why these markets offer the best value.",
                  category: "renting",
                  date: "Feb 3, 2026",
                },
                {
                  slug: "sell-home-faster",
                  title: "7 Proven Ways to Sell Your Home Faster",
                  excerpt:
                    "From staging tips and professional photography to pricing strategy and agent selection — our experts share what actually works in today's market.",
                  category: "selling",
                  date: "Mar 20, 2026",
                },
              ].map(({ slug, title, excerpt, category, date }) => (
                <Link
                  key={slug}
                  to="/blog/$slug"
                  params={{ slug }}
                  data-ocid={`blog-fallback-${slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
                >
                  <div className="h-44 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative">
                    <BookOpen className="h-10 w-10 text-primary/40" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-primary-foreground text-xs capitalize">
                        {category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {excerpt}
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Calendar
                        className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-muted-foreground">
                        {date}
                      </span>
                      <span className="ml-auto text-xs text-primary font-medium flex items-center gap-0.5">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Agent CTA Banner ──────────────────────────────────────────────── */}
      <section
        className="bg-primary py-16"
        aria-labelledby="agent-cta-heading"
        data-ocid="agent-cta-banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 mb-4 text-xs font-medium px-3">
                For Agents & Owners
              </Badge>
              <h2
                id="agent-cta-heading"
                className="font-display font-bold text-primary-foreground text-3xl sm:text-4xl mb-3"
              >
                Are you an agent?
                <span className="block">List your property for free.</span>
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl">
                Reach thousands of qualified buyers and renters. Submit your
                listing in minutes — no hidden fees, no contracts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link to="/submit-listing" data-ocid="agent-cta-submit-btn">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 w-full sm:w-auto"
                >
                  List Your Property
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/agent/dashboard" data-ocid="agent-cta-dashboard-btn">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                >
                  Agent Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
