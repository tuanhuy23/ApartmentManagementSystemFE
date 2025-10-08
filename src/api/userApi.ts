import axiosClient from "./axiosClient";
import type { User } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";

export const userApi = {
  getAll: (): Promise<ApiResponse<User[]>> => axiosClient.get("/users"),
  getById: (id: string): Promise<ApiResponse<User>> => axiosClient.get(`/users/${id}`),
  create: (data: Partial<User>): Promise<ApiResponse<User>> => axiosClient.post("/users", data),
};