import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  FileText,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BlogCategory } from "../backend";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { EmptyState } from "../components/EmptyState";
import { PageLoader } from "../components/LoadingSpinner";
import { useBlogPostBySlug } from "../hooks/useBlogPost";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { generateArticleSchema } from "../lib/schema";
import type { BlogPost } from "../types";

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
  [BlogCategory.buyingGuide]: "Buying Guides",
  [BlogCategory.rentalGuide]: "Rental Guides",
  [BlogCategory.marketTrends]: "Market Trends",
  [BlogCategory.news]: "News",
};

const CATEGORY_COLORS: Record<string, string> = {
  [BlogCategory.buyingGuide]: "bg-primary/10 text-primary border-primary/20",
  [BlogCategory.rentalGuide]:
    "bg-accent/10 text-accent-foreground border-accent/20",
  [BlogCategory.marketTrends]:
    "bg-secondary/10 text-secondary-foreground border-secondary/20",
  [BlogCategory.news]: "bg-muted text-muted-foreground border-border",
};

// ── related post card ──────────────────────────────────────────────────────────

function RelatedCard({ post }: { post: BlogPost }) {
  const readTime = estimateReadTime(post.content);
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      data-ocid="related-post-card"
      className="group flex gap-4 items-start p-4 rounded-xl border border-border bg-card hover:shadow-card transition-smooth"
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary mb-1">
          {CATEGORY_LABELS[post.category] ?? post.category}
        </p>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {post.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {readTime} min read
        </p>
      </div>
    </Link>
  );
}

// ── social share ───────────────────────────────────────────────────────────────

function SocialShare({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    });
  }

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      aria-label="Share this article"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">
        Share
      </span>
      <button
        type="button"
        onClick={handleCopy}
        data-ocid="share-copy"
        aria-label="Copy link"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-smooth"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy link
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="share-twitter"
        aria-label="Share on X (Twitter)"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-smooth"
      >
        <Twitter className="h-3.5 w-3.5" />X / Twitter
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="share-linkedin"
        aria-label="Share on LinkedIn"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-smooth"
      >
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </a>
    </div>
  );
}

// ── skeleton ───────────────────────────────────────────────────────────────────

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <Skeleton className="h-72 w-full rounded-none" />
      <div className="container mx-auto px-4 max-w-3xl py-10 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-40" />
        <div className="pt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const { data: post, isLoading } = useBlogPostBySlug(slug ?? null);

  // Related posts — same category, all published
  const categoryForRelated = post?.category ?? null;
  const { data: allInCategory } = useBlogPosts(categoryForRelated, true);
  const relatedPosts = (allInCategory ?? [])
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const pageUrl = `${window.location.origin}/blog/${slug}`;

  // SEO meta + schema injection
  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | NestFind Blog`;

    // meta description
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", post.metaDescription || post.excerpt);

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);

    // JSON-LD Article schema
    const scriptId = "article-schema";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = generateArticleSchema(post, pageUrl);
    document.head.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [post, pageUrl]);

  if (isLoading) return <BlogPostSkeleton />;

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl">
        <EmptyState
          variant="blog"
          title="Article not found"
          description="This article may have been removed or the URL is incorrect."
          ctaLabel="Back to Blog"
          ctaHref="/blog"
        />
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);
  const date = formatDate(post.publishedAt ?? post.createdAt);
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const categoryColor =
    CATEGORY_COLORS[post.category] ??
    "bg-muted text-muted-foreground border-border";

  return (
    <div className="min-h-screen bg-background">
      {/* Featured image header */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden bg-muted">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      {/* Article container */}
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumbs */}
        <div className="py-4">
          <Breadcrumbs
            items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
            injectSchema
          />
        </div>

        {/* Article header */}
        <header className="pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium border", categoryColor)}
              data-ocid="post-category-badge"
            >
              {categoryLabel}
            </Badge>
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-5">{post.excerpt}</p>

          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
            <span className="text-muted-foreground/60">
              By NestFind Editorial
            </span>
          </div>
        </header>

        {/* Rich text content */}
        <article
          data-ocid="blog-post-content"
          className="prose prose-neutral max-w-none py-8
            prose-headings:font-display prose-headings:text-foreground
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-img:rounded-xl prose-img:shadow-card
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-code:bg-muted prose-code:px-1 prose-code:rounded
            prose-hr:border-border"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-controlled, not user-submitted
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social share */}
        <div className="py-6 border-t border-b border-border mb-10">
          <SocialShare title={post.title} url={pageUrl} />
        </div>

        {/* Back to blog */}
        <div className="mb-4">
          <Button
            variant="outline"
            asChild
            data-ocid="back-to-blog"
            className="gap-2"
          >
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 border-t border-border mt-10 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              More in {categoryLabel}
            </h2>
            <div className="flex flex-col gap-4" data-ocid="related-posts">
              {relatedPosts.map((rp) => (
                <RelatedCard key={rp.id.toString()} post={rp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
