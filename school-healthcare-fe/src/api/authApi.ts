// authApi.ts
import axios from "./axiosInstance";

// Đăng nhập
export const login = async (payload: { usernameOrEmail: string; password: string }) => {
  const res = await axios.post("/Auth/login", payload);
  return res.data;
};

// Gửi OTP đặt lại mật khẩu
export const sendOtp = async (email: string) => {
  const res = await axios.post("/Auth/forgot-password-otp", { email });
  return res.data;
};

// ✅ Xác thực OTP (bước 2)
export const verifyOtp = async (email: string, otp: string) => {
  const res = await axios.post("/Auth/verify-otp-only", { email, otp });
  return res.data;
};

export const resetPassword = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await axios.post("/Auth/verify-reset-password", {
    email,    
    otp,
    newPassword,
  });
  return res.data;
};


// Đổi mật khẩu sau khi đăng nhập (có token)
export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await axios.post("/Auth/change-password", payload);
  return res.data;
};
