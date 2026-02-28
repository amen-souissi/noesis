import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Response interceptor: refresh token on 401
let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokens = useAuthStore.getState().tokens;
      if (!tokens?.refresh) {
        useAuthStore.getState().logout();
        window.location.href = "/landing";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post("/api/auth/refresh/", {
          refresh: tokens.refresh,
        });
        const newAccess = data.access;
        useAuthStore
          .getState()
          .setTokens({ access: newAccess, refresh: tokens.refresh });
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        pendingRequests.forEach((cb) => cb(newAccess));
        pendingRequests = [];

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/landing";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
