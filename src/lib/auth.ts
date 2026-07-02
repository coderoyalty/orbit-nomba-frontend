import { useSyncExternalStore } from "react";
import { authApi, type Account } from "./api";

// Cookie-based session. We can't read the httpOnly orbit_session cookie from
// JS, so "logged in?" is answered by calling /dashboard/auth/me. This store
// caches the resolved account and a load status.

type Status = "loading" | "authed" | "anon";

interface AuthState {
  status: Status;
  account: Account | null;
}

let state: AuthState = { status: "loading", account: null };
const listeners = new Set<() => void>();

function set(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

export const authStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot(): AuthState {
    return state;
  },
  // Resolve the session once on app load (and after login).
  async refresh(): Promise<boolean> {
    try {
      const account = await authApi.me();
      set({ status: "authed", account });
      return true;
    } catch {
      set({ status: "anon", account: null });
      return false;
    }
  },
  setAccount(account: Account) {
    set({ status: "authed", account });
  },
  async signOut() {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear locally regardless
    }
    set({ status: "anon", account: null });
  },
};

export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
}

export function deriveInitials(name?: string) {
  if (!name) return "";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
