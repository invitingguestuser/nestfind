import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Filter,
  LayoutGrid,
  MapPin as MapIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PropertyType } from "../backend";
import { EmptyState } from "../components/EmptyState";
import { PropertyCardSkeleton } from "../components/LoadingSpinner";
import { PropertyCard } from "../components/PropertyCard";
import { SearchBar } from "../components/SearchBar";
import { useSearchProperties } from "../hooks/useProperties";
import type { Property } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = "price-asc" | "price-desc" | "newest" | "bedrooms";
type ViewMode = "list" | "map";

interface FilterState {
  location: string;
  minPrice: string;
  maxPrice: string;
  propertyTypes: PropertyType[];
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  amenities: string[];
}

const AMENITIES = [
  "Parking",
  "Pool",
  "Gym",
  "Garden",
  "Elevator",
  "Balcony",
  "Furnished",
  "Pet-friendly",
];

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.house]: "House",
  [PropertyType.villa]: "Villa",
  [PropertyType.studio]: "Studio",
  [PropertyType.commercial]: "Commercial",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "bedrooms", label: "Most Bedrooms" },
];

const PAGE_SIZE = 12n;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortProperties(items: Property[], sort: SortOption): Property[] {
  return [...items].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return Number(a.price - b.price);
      case "price-desc":
        return Number(b.price - a.price);
      case "newest":
        return Number(b.createdAt - a.createdAt);
      case "bedrooms":
        return Number(b.bedrooms - a.bedrooms);
      default:
        return 0;
    }
  });
}

function buildUrlParams(
  location: string,
  keyword: string,
  filters: FilterState,
  sort: SortOption,
  page: number,
) {
  const params = new URLSearchParams();
  if (location) params.set("location", location);
  if (keyword) params.set("keyword", keyword);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.propertyTypes.length)
    params.set("type", filters.propertyTypes.join(","));
  if (filters.minBedrooms > 0) params.set("beds", String(filters.minBedrooms));
  if (filters.minBathrooms > 0)
    params.set("baths", String(filters.minBathrooms));
  if (filters.amenities.length)
    params.set("amenities", filters.amenities.join(","));
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  activeCount: number;
}

function CounterButton({
  value,
  max = 5,
  onChange,
}: { value: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-8 w-8 rounded-full border text-sm font-medium transition-smooth",
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary",
          )}
          aria-label={n === 0 ? "Any" : String(n) + (n === 4 ? "+" : "")}
        >
          {n === 0 ? "Any" : n === 4 ? `${max}+` : n}
        </button>
      ))}
    </div>
  );
}

function FilterPanel({
  filters,
  onChange,
  onReset,
  activeCount,
}: FilterPanelProps) {
  const update = useCallback(
    <K extends keyof FilterState>(key: K, val: FilterState[K]) => {
      onChange({ ...filters, [key]: val });
    },
    [filters, onChange],
  );

  const toggleType = (type: PropertyType) => {
    const types = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    update("propertyTypes", types);
  };

  const toggleAmenity = (amenity: string) => {
    const list = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    update("amenities", list);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-foreground">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            data-ocid="filter-reset-btn"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Location</Label>
        <Input
          placeholder="City or neighborhood"
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
          className="bg-muted border-transparent focus:border-primary"
          data-ocid="filter-location-input"
        />
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Price Range
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min $"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              className="bg-muted border-transparent focus:border-primary text-sm"
              data-ocid="filter-min-price"
              min={0}
            />
          </div>
          <span className="text-muted-foreground text-sm flex-shrink-0">–</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max $"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="bg-muted border-transparent focus:border-primary text-sm"
              data-ocid="filter-max-price"
              min={0}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Property type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Property Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {Object.values(PropertyType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-smooth",
                filters.propertyTypes.includes(type)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
              data-ocid={`filter-type-${type}`}
            >
              {PROPERTY_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bedrooms */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Bedrooms</Label>
        <CounterButton
          value={filters.minBedrooms}
          onChange={(v) => update("minBedrooms", v)}
        />
      </div>

      <Separator />

      {/* Bathrooms */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Bathrooms</Label>
        <CounterButton
          value={filters.minBathrooms}
          onChange={(v) => update("minBathrooms", v)}
        />
      </div>

      <Separator />

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Amenities</Label>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
          {AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
                data-ocid={`filter-amenity-${amenity.toLowerCase().replace(" ", "-")}`}
              />
              <Label
                htmlFor={`amenity-${amenity}`}
                className="text-sm text-foreground cursor-pointer font-normal"
              >
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Map Component ────────────────────────────────────────────────────────────

function MapView({ properties }: { properties: Property[] }) {
  const hasProps = properties.length > 0;
  const mapCenter = hasProps
    ? `${properties[0].latitude},${properties[0].longitude}`
    : "40.7128,-74.0060";

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden bg-muted"
      style={{ minHeight: "520px" }}
      data-ocid="map-view"
    >
      <img
        src={`https://picsum.photos/seed/map-${encodeURIComponent(mapCenter)}/1200/600`}
        alt="Property map"
        className="w-full h-full object-cover"
        style={{ minHeight: "520px" }}
      />
      {/* Pins overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 p-8">
          {properties.slice(0, 9).map((property, i) => (
            <button
              key={property.id.toString()}
              type="button"
              className="flex flex-col items-center gap-1 group"
              style={{
                transform: `translate(${((i % 3) - 1) * 30}px, ${(Math.floor(i / 3) - 1) * 20}px)`,
              }}
            >
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg shadow-md group-hover:scale-110 transition-smooth whitespace-nowrap">
                ${Math.round(Number(property.price) / 1000)}K
              </div>
              <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
            </button>
          ))}
        </div>
      </div>
      {/* Overlay gradient for text */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
        <p className="text-sm font-medium text-foreground text-center">
          {properties.length} properties in this area
        </p>
      </div>
    </div>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────

export default function SearchPage() {
  const navigate = useNavigate();
  const rawSearch = useSearch({ strict: false }) as Record<string, string>;

  // Parse URL params
  const keyword = rawSearch.keyword ?? "";
  const urlLocation = rawSearch.location ?? "";
  const urlSort = (rawSearch.sort as SortOption) ?? "newest";
  const urlPage = rawSearch.page ? Number.parseInt(rawSearch.page, 10) : 1;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortOption>(urlSort);
  const [page, setPage] = useState(urlPage);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    location: urlLocation,
    minPrice: rawSearch.minPrice ?? "",
    maxPrice: rawSearch.maxPrice ?? "",
    propertyTypes: rawSearch.type
      ? (rawSearch.type.split(",") as PropertyType[])
      : [],
    minBedrooms: rawSearch.beds ? Number.parseInt(rawSearch.beds, 10) : 0,
    maxBedrooms: 0,
    minBathrooms: rawSearch.baths ? Number.parseInt(rawSearch.baths, 10) : 0,
    amenities: rawSearch.amenities ? rawSearch.amenities.split(",") : [],
  });

  // Build search filters for the query
  const searchFilters = useMemo(() => {
    const f: Parameters<typeof useSearchProperties>[0] = {
      page: BigInt(page),
      pageSize: PAGE_SIZE,
    };
    if (keyword) f.keyword = keyword;
    if (filters.location) f.city = filters.location;
    if (filters.minPrice) f.minPrice = BigInt(filters.minPrice);
    if (filters.maxPrice) f.maxPrice = BigInt(filters.maxPrice);
    if (filters.propertyTypes.length === 1)
      f.propertyType = filters.propertyTypes[0];
    if (filters.minBedrooms > 0) f.minBedrooms = BigInt(filters.minBedrooms);
    if (filters.minBathrooms > 0) f.minBathrooms = BigInt(filters.minBathrooms);
    if (filters.amenities.length) f.amenities = filters.amenities;
    return f;
  }, [keyword, filters, page]);

  const { data, isLoading } = useSearchProperties(searchFilters);

  const properties = useMemo(
    () => sortProperties(data?.items ?? [], sort),
    [data?.items, sort],
  );

  const totalCount = Number(data?.total ?? 0n);
  const totalPages = Math.ceil(totalCount / Number(PAGE_SIZE));

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    count += filters.propertyTypes.length;
    if (filters.minBedrooms > 0) count++;
    if (filters.minBathrooms > 0) count++;
    count += filters.amenities.length;
    return count;
  }, [filters]);

  // Sync filters → URL
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setPage(1);
      const params = buildUrlParams(
        newFilters.location,
        keyword,
        newFilters,
        sort,
        1,
      );
      navigate({ to: `/search?${params}` });
    },
    [keyword, sort, navigate],
  );

  const resetFilters = useCallback(() => {
    applyFilters({
      location: "",
      minPrice: "",
      maxPrice: "",
      propertyTypes: [],
      minBedrooms: 0,
      maxBedrooms: 0,
      minBathrooms: 0,
      amenities: [],
    });
  }, [applyFilters]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    const params = buildUrlParams(
      filters.location,
      keyword,
      filters,
      newSort,
      page,
    );
    navigate({ to: `/search?${params}` });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = buildUrlParams(
      filters.location,
      keyword,
      filters,
      sort,
      newPage,
    );
    navigate({ to: `/search?${params}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sync page from URL
  useEffect(() => {
    if (urlPage !== page) setPage(urlPage);
  }, [urlPage, page]);

  const searchBarDefaults = {
    defaultKeyword: keyword,
    defaultCity: filters.location,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Search Bar */}
      <div
        className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
        data-ocid="sticky-search-bar"
      >
        <div className="container mx-auto px-4 py-3">
          <SearchBar variant="sticky" {...searchBarDefaults} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* ── Desktop Filter Sidebar ─────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[73px] bg-card rounded-xl border border-border p-5 shadow-card">
              <ScrollArea className="max-h-[calc(100vh-120px)]">
                <FilterPanel
                  filters={filters}
                  onChange={applyFilters}
                  onReset={resetFilters}
                  activeCount={activeFilterCount}
                />
              </ScrollArea>
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Mobile filter drawer trigger */}
              <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center gap-2"
                    data-ocid="mobile-filter-trigger"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FilterPanel
                    filters={filters}
                    onChange={(f) => {
                      applyFilters(f);
                      setFilterDrawerOpen(false);
                    }}
                    onReset={() => {
                      resetFilters();
                      setFilterDrawerOpen(false);
                    }}
                    activeCount={activeFilterCount}
                  />
                </SheetContent>
              </Sheet>

              {/* Results count */}
              <p
                className="text-sm text-muted-foreground flex-1"
                data-ocid="results-count"
              >
                {isLoading ? (
                  <span className="animate-pulse">Searching…</span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {properties.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {totalCount}
                    </span>{" "}
                    properties
                  </>
                )}
              </p>

              {/* Sort select */}
              <Select
                value={sort}
                onValueChange={(v) => handleSortChange(v as SortOption)}
              >
                <SelectTrigger
                  className="w-44 h-9 text-sm"
                  data-ocid="sort-select"
                  aria-label="Sort results"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View toggle */}
              <fieldset
                className="flex rounded-lg border border-border overflow-hidden"
                aria-label="View mode"
              >
                <legend className="sr-only">View mode</legend>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm transition-smooth",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  aria-pressed={viewMode === "list"}
                  data-ocid="view-toggle-list"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm transition-smooth",
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  aria-pressed={viewMode === "map"}
                  data-ocid="view-toggle-map"
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </fieldset>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-4"
                data-ocid="active-filters"
              >
                {filters.propertyTypes.map((type) => (
                  <FilterChip
                    key={type}
                    label={PROPERTY_TYPE_LABELS[type]}
                    onRemove={() =>
                      applyFilters({
                        ...filters,
                        propertyTypes: filters.propertyTypes.filter(
                          (t) => t !== type,
                        ),
                      })
                    }
                  />
                ))}
                {filters.minPrice && (
                  <FilterChip
                    label={`Min $${Number(filters.minPrice).toLocaleString()}`}
                    onRemove={() => applyFilters({ ...filters, minPrice: "" })}
                  />
                )}
                {filters.maxPrice && (
                  <FilterChip
                    label={`Max $${Number(filters.maxPrice).toLocaleString()}`}
                    onRemove={() => applyFilters({ ...filters, maxPrice: "" })}
                  />
                )}
                {filters.minBedrooms > 0 && (
                  <FilterChip
                    label={`${filters.minBedrooms}+ beds`}
                    onRemove={() =>
                      applyFilters({ ...filters, minBedrooms: 0 })
                    }
                  />
                )}
                {filters.minBathrooms > 0 && (
                  <FilterChip
                    label={`${filters.minBathrooms}+ baths`}
                    onRemove={() =>
                      applyFilters({ ...filters, minBathrooms: 0 })
                    }
                  />
                )}
                {filters.amenities.map((amenity) => (
                  <FilterChip
                    key={amenity}
                    label={amenity}
                    onRemove={() =>
                      applyFilters({
                        ...filters,
                        amenities: filters.amenities.filter(
                          (a) => a !== amenity,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="property-grid">
                {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
                  <PropertyCardSkeleton key={k} />
                ))}
              </div>
            ) : viewMode === "map" ? (
              <MapView properties={properties} />
            ) : properties.length === 0 ? (
              <EmptyState
                variant="search"
                onCta={resetFilters}
                ctaLabel="Clear all filters"
                data-ocid="search-empty-state"
              />
            ) : (
              <>
                <div className="property-grid">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id.toString()}
                      property={property}
                      data-ocid={`result-card-${property.id}`}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex items-center justify-center h-4 w-4 rounded-full hover:bg-primary/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    const range: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [page, totalPages]);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
      data-ocid="pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3"
        data-ocid="pagination-prev"
      >
        ‹ Prev
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-before-${pages[i + 1] ?? "end"}`}
            className="px-2 text-muted-foreground text-sm"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="w-8 h-8 p-0"
            data-ocid={`pagination-page-${p}`}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3"
        data-ocid="pagination-next"
      >
        Next ›
      </Button>
    </nav>
  );
}
