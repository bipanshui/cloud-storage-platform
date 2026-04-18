import { api } from "@/services/api";

export const authService = {
  async register(firstName, lastName, email, password) {
    const response = await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

