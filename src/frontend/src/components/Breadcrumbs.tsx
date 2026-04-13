import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";
import { generateBreadcrumbSchema } from "../lib/schema";
import type { BreadcrumbItem } from "../types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  injectSchema?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  injectSchema = false,
}: BreadcrumbsProps) {
  useEffect(() => {
    if (!injectSchema) return;
    const scriptId = "breadcrumb-schema";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = generateBreadcrumbSchema([
      { label: "Home", href: "/" },
      ...items,
    ]);
    document.head.appendChild(script);
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [items, injectSchema]);

  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground",
        className,
      )}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors duration-200 truncate max-w-[140px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate max-w-[140px]",
                  isLast && "text-foreground font-medium",
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight
                className="h-3.5 w-3.5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
