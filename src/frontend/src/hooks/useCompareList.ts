import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Property } from "../types";

export function useCompareList() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["compare-list"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompareList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCompare() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addToCompare(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compare-list"] });
    },
  });
}

export function useRemoveFromCompare() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeFromCompare(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compare-list"] });
    },
  });
}
