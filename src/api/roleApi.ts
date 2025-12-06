import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { RoleDto, DeleteRoleResponse, PermissionInfo } from "../types/role";

export const roleApi = {
  getAll: (): Promise<ApiResponse<RoleDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/role`),

  create: (data: RoleDto): Promise<ApiResponse<RoleDto>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/role`, data),

  update: (data: RoleDto): Promise<ApiResponse<RoleDto>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/role`, data),

  delete: (roleIds: string[]): Promise<ApiResponse<DeleteRoleResponse>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/role`, { data: roleIds }),

  getById: (roleId: string): Promise<ApiResponse<RoleDto>> => {
    const buildingId = getApartmentBuildingIdFromToken() || "";
    return axiosClient.get(`/${buildingId}/role/${roleId}?roleId=${roleId}`);
  },

  getPermissions: (): Promise<ApiResponse<PermissionInfo[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/role/permissions`),
};

