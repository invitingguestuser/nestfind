import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Property } from "../types";

export function useProperty(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property | null>({
    queryKey: ["property", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProperty(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSimilarProperties(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Property[]>({
    queryKey: ["property", id?.toString(), "similar"],
    queryFn: async () => {
      if (!actor || !id) return [];
      return actor.getSimilarProperties(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}
