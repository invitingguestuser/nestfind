import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Property } from "../types";

export function useSavedProperties() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["saved-properties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveProperty(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });
}

export function useUnsaveProperty() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.unsaveProperty(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });
}
