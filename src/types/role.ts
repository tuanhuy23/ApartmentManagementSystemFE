export interface RoleDto {
  roleId: string;
  roleName: string;
  permissions: PermissionInfo[];
}

export interface PermissionInfo {
  name: string;
  displayName: string;
  selected: boolean;
  type: string;
}

export interface DeleteRoleResponse {
  roleIdsDeleteSuccess: string[];
  roleIdsDeleteError: string[];
}

