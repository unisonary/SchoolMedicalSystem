import { create } from "zustand";
import { AuthResponse } from "@/types/authTypes"; // dùng lại kiểu trả về từ login

export const useAuthStore = create<{
  user: AuthResponse["user"] | null;
  isFirstLogin: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}>((set) => ({
  user: null,
  isFirstLogin: false,
  login: (userData) => set({ user: userData.user, isFirstLogin: userData.isFirstLogin }),
  logout: () => set({ user: null, isFirstLogin: false }),
}));
