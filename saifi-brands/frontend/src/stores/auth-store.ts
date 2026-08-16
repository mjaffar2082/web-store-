"use client";

import { create } from "zustand";
import { User } from "@/types";
import * as authService from "@/services/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  init: () => Promise<void>;
  login: (data: authService.LoginInput) => Promise<User>;
  register: (data: authService.RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "loading",

  init: async () => {
    try {
      const user = await authService.getMe();
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  login: async (data) => {
    const user = await authService.login(data);
    set({ user: user as unknown as User, status: "authenticated" });
    return user as unknown as User;
  },

  register: async (data) => {
    const user = await authService.register(data);
    set({ user: user as unknown as User, status: "authenticated" });
    return user as unknown as User;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  },

  setUser: (user) => set({ user }),

  refreshUser: async () => {
    const { user, status } = get();
    if (status !== "authenticated" && !user) {
      await get().init();
      return;
    }
    try {
      const fresh = await authService.getMe();
      set({ user: fresh, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));

export function useIsAdmin() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "ADMIN";
}