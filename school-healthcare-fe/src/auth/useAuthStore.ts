// src/auth/useAuthStore.ts
import { create } from "zustand";
import { AuthResponse } from "@/types/authTypes";

interface AuthStore {
  user: AuthResponse["user"] | null;
  token: string | null;
  isFirstLogin: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

// Khởi tạo từ localStorage nếu có
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isFirstLogin: false,

  login: (data) => {
    localStorage.setItem("token", data.user.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    set({
      user: data.user,
      token: data.user.token,
      isFirstLogin: data.isFirstLogin,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isFirstLogin: false,
    });
  },
}));
