import { apiClient } from "./apiClient";
import { AuthResponse } from "@/types/api";

export const authService = {
  // 1. Signup -> Sends OTP to email
  signup: async (payload: { name: string; email: string; password: string }) => {
    const res = await apiClient.post<AuthResponse>("/api/auth/signup", payload);
    return res.data;
  },

  // 2. Verify Email OTP -> Returns JWT Token & User object
  verifyEmail: async (payload: { email: string; otp: string }) => {
    const res = await apiClient.post<AuthResponse>("/api/auth/verify-email", payload);
    return res.data;
  },

  // 3. Login -> Returns JWT Token & User object
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post<AuthResponse>("/api/auth/login", payload);
    return res.data;
  },

  // 4. Request Forgot Password OTP
  forgotPassword: async (email: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      "/api/auth/forgot-password",
      { email }
    );
    return res.data;
  },

  // 5. Reset Password with OTP
  resetPassword: async (payload: { email: string; otp: string; newPassword: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      "/api/auth/reset-password",
      payload
    );
    return res.data;
  },
};
