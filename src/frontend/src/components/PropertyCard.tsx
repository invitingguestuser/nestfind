import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  GitCompare,
  Heart,
  MapPin,
  Ruler,
} from "lucide-react";
import { PropertyStatus } from "../backend";
import { useCompareStore, useSavedStore } from "../store/useStore";
import type { Property } from "../types";
import { VerificationBadge } from "./VerificationBadge";

interface PropertyCardProps {
  property: Property;
  className?: string;
  compact?: boolean;
}

function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

const typeLabels: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  studio: "Studio",
  commercial: "Commercial",
};

const statusColors: Record<string, string> = {
  approved: "bg-accent/15 text-accent",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  rejected: "bg-destructive/15 text-destructive",
  inactive: "bg-muted text-muted-foreground",
};

export function PropertyCard({
  property,
  className,
  compact = false,
}: PropertyCardProps) {
  const {
    ids: compareIds,
    add: addCompare,
    remove: removeCompare,
  } = useCompareStore();
  const { has: isSaved, toggle: toggleSaved } = useSavedStore();

  const inCompare = compareIds.some((id) => id === property.id);
  const saved = isSaved(property.id);
  const canAddCompare = compareIds.length < 4 || inCompare;

  const photo = property.photos[0] ?? "/assets/images/placeholder.svg";

  return (
    <article
      data-ocid={`property-card-${property.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border transition-all duration-300",
        "hover:shadow-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Image */}
      <Link
        to="/properties/$id"
        params={{ id: property.id.toString() }}
        className="block overflow-hidden"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            compact ? "h-40" : "h-52 sm:h-56",
          )}
        >
          <img
            src={photo}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
          {/* Status badge overlay */}
          {property.status !== PropertyStatus.approved && (
            <div className="absolute top-2 left-2">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  statusColors[property.status],
                )}
              >
                {property.status}
              </span>
            </div>
          )}
          {property.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground text-xs"
              >
                Featured
              </Badge>
            </div>
          )}
          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card"
              onClick={(e) => {
                e.preventDefault();
                toggleSaved(property.id);
              }}
              aria-label={saved ? "Remove from saved" : "Save property"}
              data-ocid="property-card-save-btn"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  saved ? "fill-primary text-primary" : "text-muted-foreground",
                )}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card",
                !canAddCompare && "opacity-40 cursor-not-allowed",
              )}
              onClick={(e) => {
                e.preventDefault();
                if (inCompare) removeCompare(property.id);
                else if (canAddCompare) addCompare(property.id);
              }}
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              data-ocid="property-card-compare-btn"
              disabled={!canAddCompare}
            >
              <GitCompare
                className={cn(
                  "h-4 w-4",
                  inCompare ? "text-primary" : "text-muted-foreground",
                )}
              />
            </Button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Type + Verification */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {typeLabels[property.propertyType] ?? property.propertyType}
          </span>
          <VerificationBadge
            verifiedAt={property.verifiedAt}
            source={property.verificationSource}
            compact
          />
        </div>

        {/* Title */}
        <Link to="/properties/$id" params={{ id: property.id.toString() }}>
          <h3 className="font-display font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Address */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <p className="font-mono text-xs truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}
            {property.city}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <BedDouble
              className="h-3.5 w-3.5 flex-shrink-0"
              aria-hidden="true"
            />
            {property.bedrooms.toString()} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {property.bathrooms.toString()} bath
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {Number(property.sqft).toLocaleString()} ft²
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-border">
          <p className="text-xl font-display font-bold text-primary">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
    </article>
  );
}
