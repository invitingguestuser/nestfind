import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  RegisterUserInput,
  UpdateUserInput,
  User,
  UserId,
  UserRole,
} from "../types";

export function useCurrentUser() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<User | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserByPrincipal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterUserInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerUser(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateUser(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUserRole() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principalId,
      role,
    }: { principalId: UserId; role: UserRole }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setUserRole(principalId, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useActivateUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principalId: UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.activateUser(principalId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeactivateUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principalId: UserId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deactivateUser(principalId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
