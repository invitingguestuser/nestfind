import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { FileText, Heart, Home, MapPin, Search } from "lucide-react";

type EmptyStateVariant = "properties" | "saved" | "search" | "blog" | "generic";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

const variants = {
  properties: {
    icon: Home,
    title: "No properties found",
    description:
      "We couldn't find any properties matching your criteria. Try adjusting your filters.",
    ctaLabel: "Clear filters",
    ctaHref: "/search",
  },
  saved: {
    icon: Heart,
    title: "No saved properties",
    description:
      "Save properties you love to compare them later and get back to them quickly.",
    ctaLabel: "Browse properties",
    ctaHref: "/search",
  },
  search: {
    icon: Search,
    title: "No results found",
    description:
      "Try different keywords, location, or property type to find what you're looking for.",
    ctaLabel: "Start a new search",
    ctaHref: "/search",
  },
  blog: {
    icon: FileText,
    title: "No articles yet",
    description:
      "Check back soon for expert guides, market insights, and tips from our team.",
    ctaLabel: "Browse properties",
    ctaHref: "/search",
  },
  generic: {
    icon: MapPin,
    title: "Nothing here yet",
    description:
      "There's nothing to show right now. Try exploring other sections.",
    ctaLabel: "Go home",
    ctaHref: "/",
  },
};

export function EmptyState({
  variant = "generic",
  title,
  description,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;
  const resolvedTitle = title ?? config.title;
  const resolvedDesc = description ?? config.description;
  const resolvedCtaLabel = ctaLabel ?? config.ctaLabel;
  const resolvedCtaHref = ctaHref ?? config.ctaHref;

  return (
    <div
      data-ocid="empty-state"
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className,
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-display font-semibold text-foreground">
        {resolvedTitle}
      </h3>
      <p className="mb-8 max-w-sm text-muted-foreground">{resolvedDesc}</p>
      {onCta ? (
        <Button onClick={onCta} data-ocid="empty-state-cta">
          {resolvedCtaLabel}
        </Button>
      ) : resolvedCtaHref ? (
        <Button asChild data-ocid="empty-state-cta">
          <Link to={resolvedCtaHref}>{resolvedCtaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
