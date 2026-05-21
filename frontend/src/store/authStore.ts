import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(username: string, email: string, password: string): Promise<void>;
  hydrateUser(): Promise<void>;
  logout(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      async login(email, password) {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },
      async register(username, email, password) {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", { username, email, password });
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },
      async hydrateUser() {
        if (!get().token) return;
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },
      logout() {
        set({ user: null, token: null });
      }
    }),
    {
      name: "ai-chatbot-auth",
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);
