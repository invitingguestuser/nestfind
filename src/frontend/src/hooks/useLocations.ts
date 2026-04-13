import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  CreateLocationInput,
  Location,
  UpdateLocationInput,
} from "../types";

export function useLocations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLocation(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Location | null>({
    queryKey: ["location", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getLocation(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useLocationBySlug(slug: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Location | null>({
    queryKey: ["location", "slug", slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      return actor.getLocationBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useNeighborhoodsByCity(cityId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Location[]>({
    queryKey: ["locations", "neighborhoods", cityId?.toString()],
    queryFn: async () => {
      if (!actor || !cityId) return [];
      return actor.listNeighborhoodsByCity(cityId);
    },
    enabled: !!actor && !isFetching && !!cityId,
  });
}

export function useCreateLocation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLocationInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createLocation(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: UpdateLocationInput }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateLocation(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
