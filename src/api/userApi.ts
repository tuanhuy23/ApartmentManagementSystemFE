import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { UserDto, CreateOrUpdateUserRequestDto, DeleteUserResponseDto } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";

export const userApi = {
  getAll: (): Promise<ApiResponse<UserDto[]>> => 
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/User`),
  
  create: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => 
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/User`, userData),
  
  update: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => 
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/User`, userData),
  
  delete: (userIds: string[]): Promise<ApiResponse<DeleteUserResponseDto>> => 
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/User`, { data: userIds }),
};