import axiosClient from "./axiosClient";
import type { RoleDto, DeleteRoleResponse } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";

export const roleApi = {
  getAll: (): Promise<ApiResponse<RoleDto[]>> => 
    axiosClient.get("/api/Role"),
  
  create: (roleData: RoleDto): Promise<ApiResponse<RoleDto>> => 
    axiosClient.post("/api/Role", roleData),
  
  update: (roleData: RoleDto): Promise<ApiResponse<RoleDto>> => 
    axiosClient.put("/api/Role", roleData),
  
  delete: (roleIds: string[]): Promise<ApiResponse<DeleteRoleResponse>> => 
    axiosClient.delete("/api/Role", { data: roleIds }),
};
