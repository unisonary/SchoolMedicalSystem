// src/types/authTypes.ts
export interface LoginDTO {
  usernameOrEmail: string;
  password: string;
}

export interface VerifyResetDTO {
  username: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  isFirstLogin: boolean;
  user: {
    userId: number;
    role: string;
    reference_id: number;
    // thêm các trường khác nếu có (ví dụ: email, name, v.v.)
  };
}

