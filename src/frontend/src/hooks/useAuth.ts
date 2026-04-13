import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { identity, loginStatus, login, clear, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = loginStatus === "success" && !!identity;
  const isLoading = isInitializing || loginStatus === "logging-in";
  const principal = identity?.getPrincipal();

  return {
    identity,
    principal,
    isAuthenticated,
    isLoading,
    loginStatus,
    login,
    logout: clear,
  };
}
