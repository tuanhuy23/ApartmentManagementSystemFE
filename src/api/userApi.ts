import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
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
    const queryParams = new URLSearchParams();
    if (params?.filters && params.filters.length > 0) {
      queryParams.append("filters", JSON.stringify(params.filters));
    }
    if (params?.sorts && params.sorts.length > 0) {
      queryParams.append("sorts", JSON.stringify(params.sorts));
    }
    
    const headers: Record<string, string> = {};
    headers.page = (params?.page ?? 1).toString();
    headers.limit = (params?.limit ?? 20).toString();
    
    const queryString = queryParams.toString();
    const url = `/${getApartmentBuildingIdFromToken() || ""}/user${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

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