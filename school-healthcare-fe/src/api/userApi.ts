// src/api/userApi.ts
import axios from "./axiosInstance";

export const getUserProfile = async () => {
  const res = await axios.get("/userprofile");
  return res.data;
};

  


