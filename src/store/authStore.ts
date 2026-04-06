import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  recent_share_emails: { email: string; name?: string; avatar?: string }[];
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  decrementCredit: () => void;
  addCredits: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        set({ token });
        if (typeof document !== "undefined") {
          if (token) {
            document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
          } else {
            document.cookie = `auth_token=; path=/; max-age=0; SameSite=Strict`;
          }
        }
      },
      setUser: (user) => set({ user }),
      logout: () => {
        set({ token: null, user: null });
        if (typeof document !== "undefined") {
          document.cookie = `auth_token=; path=/; max-age=0; SameSite=Strict`;
        }
      },
      decrementCredit: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: Math.max(0, state.user.credits - 1) }
            : null,
        })),
      addCredits: (amount: number) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: state.user.credits + amount }
            : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
