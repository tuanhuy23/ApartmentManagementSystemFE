import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { UserDto, CreateOrUpdateUserRequestDto, DeleteUserResponseDto } from "../types/user";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";

interface GetUsersParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const userApi = {
  getAll: (params?: GetUsersParams): Promise<ApiResponse<UserDto[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    const queryParams = new URLSearchParams();
    if (params?.filters && params.filters.length > 0) {
      queryParams.append("filters", JSON.stringify(params.filters));
    }
    if (params?.sorts && params.sorts.length > 0) {
      queryParams.append("sorts", JSON.stringify(params.sorts));
    }
    
    const headers: Record<string, string> = {};
    if (params?.page) {
      headers.page = params.page.toString();
    }
    if (params?.limit) {
      headers.limit = params.limit.toString();
    }
    
    const queryString = queryParams.toString();
    const url = `/${appartmentBuildingId}/user${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (userId: string): Promise<ApiResponse<UserDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/user/${userId}?userId=${userId}`);
  },

  create: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/user`, userData);
  },

  update: (userData: CreateOrUpdateUserRequestDto): Promise<ApiResponse<UserDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/user`, userData);
  },

  delete: (userIds: string[]): Promise<ApiResponse<DeleteUserResponseDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.delete(`/${appartmentBuildingId}/user`, { data: userIds });
  },
};