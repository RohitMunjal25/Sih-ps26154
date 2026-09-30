import { apiClient } from "./apiClient";
import { DashboardResponse, User } from "@/types/api";

export const userService = {
  getDashboard: async () => {
    const res = await apiClient.get<DashboardResponse>("/api/user/dashboard");
    return res.data.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<{ success: boolean; data: User }>("/api/user/profile");
    return res.data.data;
  },
};
