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
  success: boolean;
  message: string;
  user: {
    userId: number;
    username: string;
    role: string;
    token: string;
  };
  isFirstLogin: boolean;
}
