import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { BlogPost } from "../types";

export function useBlogPost(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BlogPost | null>({
    queryKey: ["blog-post", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getBlogPost(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useBlogPostBySlug(slug: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BlogPost | null>({
    queryKey: ["blog-post", "slug", slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      return actor.getBlogPostBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}
