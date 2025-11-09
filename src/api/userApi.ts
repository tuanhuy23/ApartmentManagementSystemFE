import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { UserDto, CreateOrUpdateUserRequestDto, DeleteUserResponseDto } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";

export const userApi = {
  getAll: (): Promise<ApiResponse<UserDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/user`),

  getById: (userId: string): Promise<ApiResponse<UserDto>> => {
    const buildingId = getApartmentBuildingIdFromToken() || "";
    return axiosClient.get(`/${buildingId}/user/${userId}?userId=${userId}`);
  },

  create: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/user`, userData),

  update: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/user`, userData),

  delete: (userIds: string[]): Promise<ApiResponse<DeleteUserResponseDto>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/user`, { data: userIds }),
};