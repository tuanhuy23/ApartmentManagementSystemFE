import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { RoleDto, DeleteRoleResponse, PermissionInfo } from "../types/role";

interface GetRolesParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const roleApi = {
  getAll: (params?: GetRolesParams): Promise<ApiResponse<RoleDto[]>> => {
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
    const url = `/${appartmentBuildingId}/role${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  create: (data: RoleDto): Promise<ApiResponse<RoleDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/role`, data);
  },

  update: (data: RoleDto): Promise<ApiResponse<RoleDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/role`, data);
  },

  delete: (roleIds: string[]): Promise<ApiResponse<DeleteRoleResponse>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.delete(`/${appartmentBuildingId}/role`, { data: roleIds });
  },

  getById: (roleId: string): Promise<ApiResponse<RoleDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/role/${roleId}?roleId=${roleId}`);
  },

  getPermissions: (): Promise<ApiResponse<PermissionInfo[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/role/permissions`);
  },
};

