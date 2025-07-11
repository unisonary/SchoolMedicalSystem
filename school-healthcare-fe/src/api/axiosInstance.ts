// src/api/axiosInstance.ts
import axios from "axios";
import { useAuthStore } from "@/auth/useAuthStore";

const instance = axios.create({
  baseURL: "http://localhost:7170/api",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // Lấy từ Zustand, không từ localStorage
  console.log("Attached token from Zustand:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
