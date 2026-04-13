import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { GitCompare, Heart, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { PropertyCardSkeleton } from "../components/LoadingSpinner";
import { PropertyCard } from "../components/PropertyCard";
import { useAuth } from "../hooks/useAuth";
import {
  useSavedProperties,
  useUnsaveProperty,
} from "../hooks/useSavedProperties";
import { useCompareStore } from "../store/useStore";
import type { Property } from "../types";

export default function SavedPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: properties = [], isLoading } = useSavedProperties();
  const unsave = useUnsaveProperty();
  const { ids: compareIds, add: addCompare } = useCompareStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, navigate]);

  async function handleUnsave(property: Property) {
    try {
      await unsave.mutateAsync(property.id);
      toast.success(`Removed "${property.title}" from saved.`);
    } catch {
      toast.error("Could not remove property. Try again.");
    }
  }

  function handleAddCompare(property: Property) {
    if (
      compareIds.length >= 4 &&
      !compareIds.some((id) => id === property.id)
    ) {
      toast.error("You can compare up to 4 properties at a time.");
      return;
    }
    addCompare(property.id);
    toast.success(`Added "${property.title}" to compare list.`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-foreground leading-tight">
                  Saved Properties
                </h1>
                {!isLoading && (
                  <p className="text-muted-foreground text-xs">
                    {properties.length}{" "}
                    {properties.length === 1 ? "property" : "properties"} saved
                  </p>
                )}
              </div>
            </div>
            {properties.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/properties/compare" })}
                data-ocid="saved-go-compare-btn"
              >
                <GitCompare className="h-4 w-4 mr-1.5" />
                Compare
                {compareIds.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground rounded-full text-xs h-5 w-5 flex items-center justify-center">
                    {compareIds.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {isLoading ? (
          <div className="property-grid">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <PropertyCardSkeleton key={k} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            variant="saved"
            ctaLabel="Browse properties"
            ctaHref="/search"
          />
        ) : (
          <div className="space-y-6">
            <div className="property-grid">
              {properties.map((property) => (
                <div
                  key={property.id.toString()}
                  className="relative group/saved"
                >
                  <PropertyCard property={property} />
                  {/* Quick action overlay */}
                  <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover/saved:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleUnsave(property)}
                      aria-label="Remove from saved"
                      data-ocid={`saved-remove-${property.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAddCompare(property)}
                      aria-label="Add to compare"
                      data-ocid={`saved-compare-${property.id}`}
                      disabled={
                        compareIds.length >= 4 &&
                        !compareIds.some((id) => id === property.id)
                      }
                    >
                      <GitCompare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare bar */}
            {compareIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-card border border-border rounded-2xl shadow-elevated px-5 py-3 flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    <span className="font-display font-bold text-primary">
                      {compareIds.length}
                    </span>{" "}
                    {compareIds.length === 1 ? "property" : "properties"}{" "}
                    selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/properties/compare" })}
                    data-ocid="saved-compare-bar-btn"
                  >
                    Compare now
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
