import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { CreateInquiryInput, Inquiry, InquiryStatus } from "../types";

export function useMyInquiries() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Inquiry[]>({
    queryKey: ["inquiries", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listInquiryByUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePropertyInquiries(propertyId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Inquiry[]>({
    queryKey: ["inquiries", "property", propertyId?.toString()],
    queryFn: async () => {
      if (!actor || !propertyId) return [];
      return actor.listInquiryByProperty(propertyId);
    },
    enabled: !!actor && !isFetching && !!propertyId,
  });
}

export function useAllInquiries() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Inquiry[]>({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllInquiries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInquiry() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInquiryInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createInquiry(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useUpdateInquiryStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: InquiryStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateInquiryStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}
