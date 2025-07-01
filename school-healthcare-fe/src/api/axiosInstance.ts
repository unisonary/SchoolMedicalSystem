// src/api/axiosInstance.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:7170/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Attached token:", token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;

