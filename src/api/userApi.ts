import axiosClient from "./axiosClient";
import type { UserDto, CreateOrUpdateUserRequestDto, DeleteUserResponseDto } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";

export const userApi = {
  getAll: (): Promise<ApiResponse<UserDto[]>> => 
    axiosClient.get("/api/User"),
  
  create: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => 
    axiosClient.post("/api/User", userData),
  
  update: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => 
    axiosClient.put("/api/User", userData),
  
  delete: (userIds: string[]): Promise<ApiResponse<DeleteUserResponseDto>> => 
    axiosClient.delete("/api/User", { data: userIds }),
};