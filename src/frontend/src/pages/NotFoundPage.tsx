import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Home, Search } from "lucide-react";
import { useEffect } from "react";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found — NestFind";
    const prev = document.querySelector(
      'meta[name="robots"]',
    ) as HTMLMetaElement | null;
    let el = prev;
    if (!el) {
      el = document.createElement("meta");
      el.name = "robots";
      document.head.appendChild(el);
    }
    el.content = "noindex";
    return () => {
      if (el) el.content = "index, follow";
    };
  }, []);

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 py-24">
      {/* Illustration */}
      <div className="relative mb-8 select-none" aria-hidden="true">
        {/* Background circle */}
        <div className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/15 flex items-center justify-center">
            {/* House icon */}
            <svg
              viewBox="0 0 80 80"
              className="h-20 w-20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="House illustration with question mark"
            >
              <path
                d="M10 38L40 10L70 38"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/50"
              />
              <path
                d="M18 32V66H62V32"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/50"
              />
              <path
                d="M30 66V48H50V66"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/50"
              />
              {/* Question mark */}
              <text
                x="36"
                y="42"
                fontSize="20"
                fontWeight="bold"
                className="fill-primary"
                fill="currentColor"
              >
                ?
              </text>
            </svg>
          </div>
        </div>
        {/* 404 badge */}
        <div className="absolute -top-2 -right-2 h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-md">
          <span className="text-primary-foreground font-display font-bold text-sm leading-none">
            404
          </span>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-3">
        We lost this property
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
        The page you're looking for doesn't exist, may have been moved, or the
        URL might be incorrect. Let's help you find what you need.
      </p>

      {/* Primary actions */}
      <div
        className="flex flex-col sm:flex-row gap-3 mb-12 w-full max-w-sm"
        data-ocid="not-found-actions"
      >
        <Button
          asChild
          size="lg"
          className="flex-1"
          data-ocid="not-found-home-btn"
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-2" aria-hidden="true" />
            Go Home
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="flex-1"
          data-ocid="not-found-search-btn"
        >
          <Link to="/search">
            <Search className="h-4 w-4 mr-2" aria-hidden="true" />
            Search Properties
          </Link>
        </Button>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-sm border-t border-border pt-8">
        <p className="text-sm text-muted-foreground text-center mb-4 font-medium uppercase tracking-wide">
          Popular pages
        </p>
        <nav className="flex flex-col gap-2" aria-label="Popular pages">
          <Link
            to="/search"
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors duration-200 group"
            data-ocid="not-found-link-search"
          >
            <span className="text-sm font-medium">Browse all properties</span>
            <ArrowRight
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/type/$type"
            params={{ type: "house" }}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors duration-200 group"
            data-ocid="not-found-link-houses"
          >
            <span className="text-sm font-medium">Houses for sale</span>
            <ArrowRight
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/type/$type"
            params={{ type: "apartment" }}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors duration-200 group"
            data-ocid="not-found-link-apartments"
          >
            <span className="text-sm font-medium">Apartments for rent</span>
            <ArrowRight
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
          </Link>
        </nav>
      </div>
    </div>
  );
}
