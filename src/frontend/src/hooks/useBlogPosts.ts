import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  BlogCategory,
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from "../types";

export function useBlogPosts(
  category: BlogCategory | null = null,
  publishedOnly = true,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BlogPost[]>({
    queryKey: ["blog-posts", category, publishedOnly],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBlogPosts(category, publishedOnly ? true : null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBlogPost() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBlogPostInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createBlogPost(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: UpdateBlogPostInput }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateBlogPost(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
