import api from "./client";
import type {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

export const login = (data: LoginRequest) =>
  api.post<AuthTokens>("/auth/login/", data);

export const register = (data: RegisterRequest) =>
  api.post<{ user: User; tokens: AuthTokens }>("/auth/register/", data);

export const refreshToken = (refresh: string) =>
  api.post<{ access: string }>("/auth/refresh/", { refresh });

export const getMe = () => api.get<User>("/auth/me/");
