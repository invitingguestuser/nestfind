import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AdminStats, FlagAction, FlaggedContent } from "../types";

export function useAdminStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      if (!actor)
        return {
          activeUsers: 0n,
          pendingApprovals: 0n,
          totalBlogPosts: 0n,
          totalListings: 0n,
          totalInquiries: 0n,
        };
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useFlaggedContent() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FlaggedContent[]>({
    queryKey: ["admin", "flagged"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFlaggedContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReviewFlaggedContent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      flagId,
      action,
    }: { flagId: bigint; action: FlagAction }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.reviewFlaggedContent(flagId, action);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "flagged"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
