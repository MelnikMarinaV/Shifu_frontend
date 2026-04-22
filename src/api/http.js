import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Django dev server
});

// Attach access token before each request
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// Handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    const original = error.config;

    // If token expired and we have refresh, try to refresh once
    if (
      error.response?.status === 401 &&
      auth.refreshToken &&
      !original._retry
    ) {
      original._retry = true;
      try {
        await auth.refreshTokens(); // defined in the store
        original.headers.Authorization = `Bearer ${auth.accessToken}`;
        return api(original); // retry original request
      } catch (err) {
        auth.logout();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
