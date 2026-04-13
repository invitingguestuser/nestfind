import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  GitCompare,
  MapPin,
  Plus,
  Ruler,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PropertyStatus } from "../backend";
import { EmptyState } from "../components/EmptyState";
import { useCompareList, useRemoveFromCompare } from "../hooks/useCompareList";
import type { Property } from "../types";

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

type SlotKey = "s1" | "s2" | "s3" | "s4";
const SLOT_KEYS: SlotKey[] = ["s1", "s2", "s3", "s4"];

interface CompareColumnProps {
  property: Property;
  onRemove: () => void;
}

function CompareColumn({ property, onRemove }: CompareColumnProps) {
  const photo = property.photos[0] ?? "/assets/images/placeholder.svg";
  return (
    <div className="flex flex-col" data-ocid={`compare-col-${property.id}`}>
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] mb-4">
        <img
          src={photo}
          alt={property.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label={`Remove ${property.title} from compare`}
          data-ocid={`compare-remove-${property.id}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {property.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary text-primary-foreground text-xs">
              Featured
            </Badge>
          </div>
        )}
      </div>
      <Link
        to="/properties/$id"
        params={{ id: property.id.toString() }}
        className="font-display font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug mb-1"
      >
        {property.title}
      </Link>
      <div className="flex items-center gap-1 text-muted-foreground mb-2">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        <span className="text-xs truncate">
          {property.neighborhood ? `${property.neighborhood}, ` : ""}
          {property.city}
        </span>
      </div>
    </div>
  );
}

interface TableEntry {
  slotKey: SlotKey;
  node: React.ReactNode;
}

interface TableRowProps {
  label: string;
  entries: TableEntry[];
  highlight?: boolean;
}

function TableRow({ label, entries, highlight }: TableRowProps) {
  const usedKeys = new Set(entries.map((e) => e.slotKey));
  const emptyKeys = SLOT_KEYS.filter((k) => !usedKeys.has(k));
  return (
    <tr className={highlight ? "bg-primary/5" : "even:bg-muted/30"}>
      <td className="py-3 px-4 text-sm font-medium text-muted-foreground w-28 whitespace-nowrap sticky left-0 bg-card border-r border-border">
        {label}
      </td>
      {entries.map(({ slotKey, node }) => (
        <td
          key={`val-${label}-${slotKey}`}
          className="py-3 px-4 text-sm text-foreground font-medium border-r border-border last:border-r-0 min-w-[160px]"
        >
          {node}
        </td>
      ))}
      {emptyKeys.map((k) => (
        <td
          key={`mt-${label}-${k}`}
          className="py-3 px-4 border-r border-border last:border-r-0 min-w-[160px]"
        />
      ))}
    </tr>
  );
}

function AddMoreCard() {
  return (
    <Link
      to="/search"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 aspect-[4/3]"
      data-ocid="compare-add-more-btn"
    >
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium text-muted-foreground text-sm">Add property</p>
    </Link>
  );
}

export default function ComparePage() {
  const { data: properties = [], isLoading } = useCompareList();
  const removeFromCompare = useRemoveFromCompare();

  async function handleRemove(property: Property) {
    try {
      await removeFromCompare.mutateAsync(property.id);
      toast.success(`Removed "${property.title}" from compare.`);
    } catch {
      toast.error("Could not remove property. Try again.");
    }
  }

  // Map each property to a stable slot key
  const propEntries = properties.map((p, i) => ({
    p,
    slotKey: SLOT_KEYS[i] as SlotKey,
  }));
  const usedSlots = propEntries.map((e) => e.slotKey);
  const emptySlots = SLOT_KEYS.filter((k) => !usedSlots.includes(k));

  function makeEntries(render: (p: Property) => React.ReactNode): TableEntry[] {
    return propEntries.map(({ p, slotKey }) => ({ slotKey, node: render(p) }));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GitCompare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Compare Properties
                </h1>
                <p className="text-muted-foreground text-sm">
                  Side-by-side comparison of up to 4 properties
                </p>
              </div>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link to="/search">Browse more properties</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SLOT_KEYS.map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            variant="generic"
            title="Nothing to compare yet"
            description="Browse properties and use the compare button to add up to 4 homes side by side."
            ctaLabel="Search properties"
            ctaHref="/search"
          />
        ) : (
          <div className="space-y-8">
            {/* Property cards row — horizontally scrollable on mobile */}
            <div className="overflow-x-auto -mx-4 px-4">
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${propEntries.length + emptySlots.length}, minmax(200px, 1fr))`,
                  minWidth: `${(propEntries.length + emptySlots.length) * 220}px`,
                }}
              >
                {propEntries.map(({ p, slotKey }) => (
                  <CompareColumn
                    key={slotKey}
                    property={p}
                    onRemove={() => handleRemove(p)}
                  />
                ))}
                {emptySlots.map((k) => (
                  <AddMoreCard key={k} />
                ))}
              </div>
            </div>

            {/* Comparison table */}
            <div className="rounded-xl border border-border overflow-x-auto shadow-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky left-0 bg-muted/50 border-r border-border w-28">
                      Feature
                    </th>
                    {propEntries.map(({ p, slotKey }) => (
                      <th
                        key={slotKey}
                        className="py-3 px-4 text-left text-xs font-semibold text-foreground uppercase tracking-wide border-r border-border last:border-r-0 min-w-[160px]"
                      >
                        <span className="line-clamp-1">{p.title}</span>
                      </th>
                    ))}
                    {emptySlots.map((k) => (
                      <th
                        key={k}
                        className="py-3 px-4 border-r border-border last:border-r-0 min-w-[160px]"
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <TableRow
                    label="Price"
                    highlight
                    entries={makeEntries((p) => (
                      <span className="font-display font-bold text-primary text-base">
                        {formatPrice(p.price)}
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Address"
                    entries={makeEntries((p) => (
                      <span className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span className="line-clamp-2">{p.address}</span>
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Type"
                    entries={makeEntries((p) => (
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[p.propertyType] ?? p.propertyType}
                      </Badge>
                    ))}
                  />
                  <TableRow
                    label="Status"
                    entries={makeEntries((p) => (
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === PropertyStatus.approved
                            ? "bg-accent/15 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Bedrooms"
                    entries={makeEntries((p) => (
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        {p.bedrooms.toString()} beds
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Bathrooms"
                    entries={makeEntries((p) => (
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        {p.bathrooms.toString()} baths
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Sq Ft"
                    entries={makeEntries((p) => (
                      <span className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        {Number(p.sqft).toLocaleString()} ft²
                      </span>
                    ))}
                  />
                  <TableRow
                    label="Amenities"
                    entries={makeEntries((p) =>
                      p.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.amenities.slice(0, 4).map((a) => (
                            <Badge
                              key={a}
                              variant="outline"
                              className="text-xs px-1.5 py-0"
                            >
                              {a}
                            </Badge>
                          ))}
                          {p.amenities.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0"
                            >
                              +{p.amenities.length - 4}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      ),
                    )}
                  />
                </tbody>
              </table>
            </div>

            {/* CTA row — flex matching actual compare columns */}
            <div className="overflow-x-auto -mx-4 px-4">
              <div
                className="flex gap-4"
                style={{
                  minWidth: `${(propEntries.length + emptySlots.length) * 220}px`,
                }}
              >
                {propEntries.map(({ p, slotKey }) => (
                  <Button
                    key={slotKey}
                    asChild
                    className="flex-1 min-w-[200px]"
                    data-ocid={`compare-view-${slotKey}`}
                  >
                    <Link to="/properties/$id" params={{ id: p.id.toString() }}>
                      View details
                    </Link>
                  </Button>
                ))}
                {emptySlots.map((k) => (
                  <Button
                    key={k}
                    variant="outline"
                    asChild
                    className="flex-1 min-w-[200px]"
                  >
                    <Link to="/search">+ Add property</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
