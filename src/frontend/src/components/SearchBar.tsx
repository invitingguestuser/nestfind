import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useSearchStore } from "../store/useStore";

interface SearchBarProps {
  variant?: "hero" | "sticky" | "compact";
  className?: string;
  defaultKeyword?: string;
  defaultCity?: string;
  defaultType?: string;
}

const PROPERTY_TYPES = [
  { value: "", label: "Any type" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
];

export function SearchBar({
  variant = "hero",
  className,
  defaultKeyword = "",
  defaultCity = "",
  defaultType = "",
}: SearchBarProps) {
  const navigate = useNavigate();
  const setFilters = useSearchStore((s) => s.setFilters);

  const [keyword, setKeyword] = useState(defaultKeyword);
  const [city, setCity] = useState(defaultCity);
  const [propertyType, setPropertyType] = useState(defaultType);

  const handleSearch = () => {
    setFilters({ keyword, city, propertyType });
    navigate({ to: "/search", search: { keyword, city, propertyType } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search properties, cities…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-muted border-transparent focus:border-primary"
            data-ocid="search-input-compact"
            aria-label="Search properties"
          />
        </div>
        <Button
          onClick={handleSearch}
          size="sm"
          data-ocid="search-btn-compact"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="search-bar"
      className={cn(
        "w-full rounded-2xl bg-card shadow-elevated",
        variant === "hero" ? "p-2 sm:p-3" : "p-2 rounded-xl shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2",
          variant === "hero"
            ? "sm:flex-row sm:items-center"
            : "sm:flex-row sm:items-center",
        )}
      >
        {/* Location input */}
        <div className="relative flex-1 min-w-0">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="City or neighborhood"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 border-transparent bg-transparent focus:bg-muted/50 focus:border-primary text-sm"
            data-ocid="search-city-input"
            aria-label="Location"
          />
        </div>

        <div
          className="hidden sm:block w-px h-8 bg-border"
          aria-hidden="true"
        />

        {/* Keyword input */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Property type, keyword…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 border-transparent bg-transparent focus:bg-muted/50 focus:border-primary text-sm"
            data-ocid="search-keyword-input"
            aria-label="Keyword search"
          />
        </div>

        <div
          className="hidden sm:block w-px h-8 bg-border"
          aria-hidden="true"
        />

        {/* Property type */}
        <div className="relative">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="appearance-none cursor-pointer bg-transparent pl-3 pr-8 py-2 text-sm border-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded-lg w-full sm:w-auto text-foreground"
            data-ocid="search-type-select"
            aria-label="Property type"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
        </div>

        <Button
          onClick={handleSearch}
          size={variant === "hero" ? "default" : "sm"}
          className="sm:flex-shrink-0 font-medium"
          data-ocid="search-submit-btn"
        >
          <Search className="h-4 w-4 mr-2" aria-hidden="true" />
          Search
        </Button>
      </div>
    </div>
  );
}
