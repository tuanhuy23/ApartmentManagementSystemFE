export interface UserDto {
    userId: string | null;
    displayName: string | null;
    email: string | null;
    roleName: string | null;
    roleId: string | null;
    userName: string | null;
    appartmentId: string | null;
    appartmentName: string | null;
    phoneNumber: string | null;
}

export interface CreateOrUpdateUserRequestDto {
    userId: string | null;
    displayName: string | null;
    email: string | null;
    roleId: string | null;
    possition: string | null;
    userName: string | null;
    phoneNumber: string | null;
    appartmentBuildingId: string | null;
}

export interface DeleteUserResponseDto {
    userIdsDeleteSuccess: string[] | null;
    userIdsDeleteError: string[] | null;
}

export interface LoginRequestDto {
    userName: string | null;
    password: string | null;
}

export interface TokenResponseDto {
    accessToken: string | null;
    expireTime: string; // date-time format
    refreshToken: string | null;
}

export interface AccountInfoResponseDto {
    id: string | null;
    email: string | null;
    displayName: string | null;
    userName: string | null;
    role: string | null;
    permissions: string[] | null;
}

export interface RefreshTokenRequestDto {
    refreshToken: string | null;
}

export interface ChangePasswordRequestDto {
    oldPassword: string | null;
    newPassword: string | null;
    confirmNewPassword: string | null;
}

export interface ChangePasswordResponseDto {
    isSuccess: boolean;
}

export interface UpdatePasswordInFirstTimeLoginRequestDto {
    userName: string | null;
    newPassword: string | null;
}

export interface UpdatePasswordInFirstTimeLoginResponseDto {
    isSuccess: boolean;
}

export interface PermissionInfo {
    name: string | null;
    displayName: string | null;
    selected: boolean;
    type: string | null;
}

export interface RoleDto {
    roleId: string | null;
    roleName: string | null;
    permissions: PermissionInfo[] | null;
}

export interface DeleteRoleResponse {
    roleIdsDeleteSuccess: string[] | null;
    roleIdsDeleteError: string[] | null;
}
