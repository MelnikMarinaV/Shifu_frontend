import { defineStore } from "pinia";
import api from "@/api/http";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    user: null,
  }),

  actions: {
    async register({ username, email, password, password_confirm }) {
      await api.post("/api/auth/register/", {
        username,
        email,
        password,
        password_confirm,
      });

      await this.login({ username, password });
    },

    async login({ username, password }) {
      const { data } = await api.post("/api/auth/token/", {
        username,
        password,
      });
      this.accessToken = data.access;
      this.refreshToken = data.refresh;
      localStorage.setItem("refreshToken", data.refresh);
      await this.fetchCurrentUser();
    },

    async fetchCurrentUser() {
      const { data } = await api.get("/api/auth/me/");
      this.user = data;
    },

    async updateProfilePicture(file) {
      const formData = new FormData();
      formData.append("avatar", file); // or 'photo', 'profile_picture' - match your backend field name

      const { data } = await api.patch("/api/auth/me/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      this.user = data;
      return data;
    },

    async refreshTokens() {
      if (!this.refreshToken) throw new Error("No refresh token");
      const { data } = await api.post("/api/auth/token/refresh/", {
        refresh: this.refreshToken,
      });
      this.accessToken = data.access;
    },

    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem("refreshToken");
    },

    async bootstrap() {
      try {
        if (this.refreshToken) {
          await this.refreshTokens();
          await this.fetchCurrentUser();
        }
      } catch (err) {
        this.logout();
      }
    },
  },
});
