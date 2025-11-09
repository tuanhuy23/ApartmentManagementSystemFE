import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { RoleDto, DeleteRoleResponse } from "../types/role";

export const roleApi = {
  getAll: (): Promise<ApiResponse<RoleDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/role`),

  create: (data: RoleDto): Promise<ApiResponse<RoleDto>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/role`, data),

  update: (data: RoleDto): Promise<ApiResponse<RoleDto>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/role`, data),

  delete: (roleIds: string[]): Promise<ApiResponse<DeleteRoleResponse>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/role`, { data: roleIds }),
};

