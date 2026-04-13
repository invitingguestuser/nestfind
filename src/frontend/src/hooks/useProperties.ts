import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { PropertyType } from "../backend";
import type { Page, Property, SearchFilters, UserId } from "../types";

export function useFeaturedProperties() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["properties", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListProperties(page = 1n, pageSize = 12n) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Page>({
    queryKey: ["properties", "list", page.toString(), pageSize.toString()],
    queryFn: async () => {
      if (!actor) return { total: 0n, page: 1n, pageSize: 12n, items: [] };
      return actor.listProperties(page, pageSize);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProperties(
  filters: Partial<SearchFilters> & { page: bigint; pageSize: bigint },
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Page>({
    queryKey: ["properties", "search", JSON.stringify(filters)],
    queryFn: async () => {
      if (!actor) return { total: 0n, page: 1n, pageSize: 12n, items: [] };
      return actor.searchProperties(filters as SearchFilters);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePropertiesByCity(city: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["properties", "city", city],
    queryFn: async () => {
      if (!actor || !city) return [];
      return actor.getPropertiesByCity(city);
    },
    enabled: !!actor && !isFetching && !!city,
  });
}

export function usePropertiesByNeighborhood(neighborhood: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["properties", "neighborhood", neighborhood],
    queryFn: async () => {
      if (!actor || !neighborhood) return [];
      return actor.getPropertiesByNeighborhood(neighborhood);
    },
    enabled: !!actor && !isFetching && !!neighborhood,
  });
}

export function usePropertiesByType(propertyType: PropertyType | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["properties", "type", propertyType],
    queryFn: async () => {
      if (!actor || !propertyType) return [];
      return actor.getPropertiesByType(propertyType);
    },
    enabled: !!actor && !isFetching && !!propertyType,
  });
}

export function useCreateProperty() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Parameters<NonNullable<typeof actor>["createProperty"]>[0],
    ) => {
      if (!actor || isFetching)
        throw new Error(
          "Connection not ready. Please wait a moment and try again.",
        );
      return actor.createProperty(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: unknown) => {
      console.error("[useCreateProperty] Failed to create property:", error);
    },
  });
}

export function useUpdateProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: Parameters<NonNullable<typeof actor>["updateProperty"]>[1];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProperty(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProperty(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useApproveProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, source }: { id: bigint; source: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.approveProperty(id, source);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useRejectProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: bigint; reason: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rejectProperty(id, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useAgentListings(agentId: UserId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["properties", "agent", agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return [];
      return actor.getAgentListings(agentId);
    },
    enabled: !!actor && !isFetching && !!agentId,
  });
}
