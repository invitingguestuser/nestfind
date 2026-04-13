import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { BlogCategory } from "../backend";
import { EmptyState } from "../components/EmptyState";
import { useBlogPosts } from "../hooks/useBlogPosts";

// ── helpers ────────────────────────────────────────────────────────────────────

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  [BlogCategory.buyingGuide]: "Buying Guides",
  [BlogCategory.rentalGuide]: "Rental Guides",
  [BlogCategory.marketTrends]: "Market Trends",
  [BlogCategory.news]: "News",
};

const CATEGORY_COLORS: Record<string, string> = {
  [BlogCategory.buyingGuide]: "bg-primary/10 text-primary",
  [BlogCategory.rentalGuide]: "bg-accent/10 text-accent-foreground",
  [BlogCategory.marketTrends]: "bg-secondary/10 text-secondary-foreground",
  [BlogCategory.news]: "bg-muted text-muted-foreground",
};

// ── skeleton ───────────────────────────────────────────────────────────────────

function BlogCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// ── post card ──────────────────────────────────────────────────────────────────

interface BlogCardProps {
  post: {
    id: bigint;
    title: string;
    excerpt: string;
    category: BlogCategory;
    featuredImageUrl: string;
    publishedAt?: bigint;
    createdAt: bigint;
    slug: string;
    content: string;
  };
}

function BlogCard({ post }: BlogCardProps) {
  const readTime = estimateReadTime(post.content);
  const date = formatDate(post.publishedAt ?? post.createdAt);
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const categoryColor =
    CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground";

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      data-ocid="blog-card"
      className="group flex flex-col rounded-xl border border-border overflow-hidden bg-card hover:shadow-elevated transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={post.title}
    >
      {/* Featured image */}
      <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full",
            categoryColor,
          )}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h2 className="font-display font-semibold text-foreground text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

const TABS = [
  { value: "all", label: "All" },
  { value: BlogCategory.buyingGuide, label: "Buying Guides" },
  { value: BlogCategory.rentalGuide, label: "Rental Guides" },
  { value: BlogCategory.marketTrends, label: "Market Trends" },
  { value: BlogCategory.news, label: "News" },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categoryParam =
    activeCategory === "all" ? null : (activeCategory as BlogCategory);
  const { data: posts, isLoading } = useBlogPosts(categoryParam, true);

  // SEO meta
  useEffect(() => {
    document.title = "Blog — Real Estate Guides & Market Insights | NestFind";
    const desc = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "Explore expert buying guides, rental tips, market trends, and real estate news from the NestFind editorial team.",
      );
    }
    if (canonical) {
      canonical.setAttribute("href", `${window.location.origin}/blog`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
            Editorial
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Real Estate Insights
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Expert guides, market trends, and tips to help you buy, rent, or
            sell with confidence.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div
            className="flex gap-1 overflow-x-auto py-3 scrollbar-none"
            role="tablist"
            aria-label="Filter by category"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.value}
                data-ocid={`blog-tab-${tab.value}`}
                onClick={() => setActiveCategory(tab.value)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-smooth",
                  activeCategory === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post grid */}
      <section className="container mx-auto px-4 max-w-5xl py-10">
        {isLoading ? (
          <div className="property-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no id
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <EmptyState
            variant="blog"
            title="No articles in this category"
            description="Try selecting a different category or check back later."
          />
        ) : (
          <>
            <p
              className="text-sm text-muted-foreground mb-6"
              aria-live="polite"
            >
              {posts.length} article{posts.length !== 1 ? "s" : ""}
              {activeCategory !== "all" &&
                ` in ${CATEGORY_LABELS[activeCategory] ?? activeCategory}`}
            </p>
            <div className="property-grid" data-ocid="blog-post-list">
              {posts.map((post) => (
                <BlogCard key={post.id.toString()} post={post} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
