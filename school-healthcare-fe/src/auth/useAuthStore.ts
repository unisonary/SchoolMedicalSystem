// src/auth/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponse } from "@/types/authTypes";

interface AuthStore {
  user: AuthResponse["user"] | null;
  token: string | null;
  isFirstLogin: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isFirstLogin: false,

      login: (data) => {
        set({
          user: data.user,
          token: data.user.token,
          isFirstLogin: data.isFirstLogin,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isFirstLogin: false,
        });
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isFirstLogin: state.isFirstLogin,
      }),
    }
  )
);
