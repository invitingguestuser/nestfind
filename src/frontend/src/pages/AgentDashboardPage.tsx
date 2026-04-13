import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  House,
  MapPin,
  PlusCircle,
  RefreshCw,
  Ruler,
  XCircle,
} from "lucide-react";
import { PropertyStatus } from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useAgentListings } from "../hooks/useProperties";
import type { Property } from "../types";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  [PropertyStatus.approved]: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClass: "bg-accent/15 text-accent border-accent/30",
  },
  [PropertyStatus.pending]: {
    label: "Pending Review",
    icon: Clock,
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/40",
  },
  [PropertyStatus.rejected]: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
  },
  [PropertyStatus.inactive]: {
    label: "Inactive",
    icon: House,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatPrice(price: bigint): string {
  const n = Number(price);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  status,
  total,
}: {
  label: string;
  value: number;
  status?: PropertyStatus;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const config = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {config && (
          <config.icon
            className={cn(
              "h-4 w-4",
              status === PropertyStatus.approved
                ? "text-accent"
                : status === PropertyStatus.pending
                  ? "text-yellow-500"
                  : status === PropertyStatus.rejected
                    ? "text-destructive"
                    : "text-muted-foreground",
            )}
          />
        )}
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status === PropertyStatus.approved
              ? "bg-accent"
              : status === PropertyStatus.pending
                ? "bg-yellow-400"
                : status === PropertyStatus.rejected
                  ? "bg-destructive"
                  : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct}% of total</p>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ property }: { property: Property }) {
  const statusConf = STATUS_CONFIG[property.status];
  const photo = property.photos[0] ?? "/assets/images/placeholder.svg";

  return (
    <article
      data-ocid={`listing-card-${property.id}`}
      className="rounded-xl border border-border bg-card overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-card"
    >
      {/* Photo */}
      <div className="relative h-44 sm:h-auto sm:w-40 flex-shrink-0 bg-muted overflow-hidden">
        <img
          src={photo}
          alt={property.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        <Badge
          variant="outline"
          className={cn(
            "absolute top-2 left-2 text-xs font-semibold",
            statusConf.badgeClass,
          )}
        >
          <statusConf.icon className="h-3 w-3 mr-1" />
          {statusConf.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-foreground line-clamp-2 flex-1 min-w-0">
            {property.title}
          </h3>
          <p className="font-display font-bold text-primary text-lg flex-shrink-0">
            {formatPrice(property.price)}
          </p>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <p className="text-xs truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}
            {property.city}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {property.bedrooms.toString()} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {property.bathrooms.toString()} bath
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            {Number(property.sqft).toLocaleString()} ft²
          </span>
        </div>

        {/* Rejection reason */}
        {property.status === PropertyStatus.rejected && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 mt-1">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-destructive">
                Rejection reason
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                {/* Rejection reason would come from backend — placeholder */}
                This listing did not meet our content guidelines. Please review
                and resubmit with accurate information and clear photos.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {property.status === PropertyStatus.approved && (
            <Button
              asChild
              size="sm"
              variant="outline"
              data-ocid="btn-view-listing"
            >
              <Link
                to="/properties/$id"
                params={{ id: property.id.toString() }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Listing
              </Link>
            </Button>
          )}
          {(property.status === PropertyStatus.rejected ||
            property.status === PropertyStatus.inactive) && (
            <Button asChild size="sm" data-ocid="btn-resubmit-listing">
              <Link to="/submit-listing">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Re-submit
              </Link>
            </Button>
          )}
          {property.status === PropertyStatus.pending && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Under review — typically 24–48 hrs
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function ListingCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="h-44 sm:h-auto sm:w-40 flex-shrink-0 bg-muted" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-5 flex-1 max-w-xs" />
          <Skeleton className="h-5 w-16 flex-shrink-0" />
        </div>
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function NListingsEmpty() {
  return (
    <div
      data-ocid="agent-listings-empty"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-9 w-9 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
        No listings yet
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        You haven't submitted any property listings. Submit your first listing
        to reach thousands of buyers and renters.
      </p>
      <Button asChild data-ocid="btn-submit-first-listing">
        <Link to="/submit-listing">
          <PlusCircle className="h-4 w-4 mr-2" />
          Submit Your First Listing
        </Link>
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentDashboardPage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    login,
    principal,
  } = useAuth();
  const { data: listings = [], isLoading } = useAgentListings(
    isAuthenticated && principal ? principal : null,
  );

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center bg-card border border-border rounded-2xl p-10">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Agent Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to manage your property listings and track their approval
            status.
          </p>
          <Button
            className="w-full"
            onClick={login}
            data-ocid="dashboard-login-btn"
          >
            Sign in to Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total = listings.length;
  const approved = listings.filter(
    (l) => l.status === PropertyStatus.approved,
  ).length;
  const pending = listings.filter(
    (l) => l.status === PropertyStatus.pending,
  ).length;
  const rejected = listings.filter(
    (l) => l.status === PropertyStatus.rejected,
  ).length;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero band */}
      <div className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
                My Listings
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage and track your property submissions.
              </p>
            </div>
            <Button asChild data-ocid="btn-new-listing">
              <Link to="/submit-listing">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <section aria-label="Listing statistics">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Submitted" value={total} total={total} />
            <StatCard
              label="Approved"
              value={approved}
              status={PropertyStatus.approved}
              total={total}
            />
            <StatCard
              label="Pending Review"
              value={pending}
              status={PropertyStatus.pending}
              total={total}
            />
            <StatCard
              label="Rejected"
              value={rejected}
              status={PropertyStatus.rejected}
              total={total}
            />
          </div>
        </section>

        {/* Listings */}
        <section aria-label="Your property listings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Your Properties
            </h2>
            {total > 0 && (
              <span className="text-sm text-muted-foreground">
                {total} listing{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card">
              <NListingsEmpty />
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((property) => (
                <ListingCard key={property.id.toString()} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* Tips banner */}
        {!isLoading && listings.length > 0 && (
          <section className="rounded-2xl border border-border bg-muted/30 p-6">
            <h3 className="font-display font-semibold text-foreground mb-2">
              Tips for faster approval
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>Upload at least 5 high-quality, well-lit photos</li>
              <li>Write a detailed description of at least 150 words</li>
              <li>Include accurate coordinates for map placement</li>
              <li>Ensure your contact details are up-to-date</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
