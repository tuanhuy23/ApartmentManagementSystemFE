export interface UserDto {
    userId: string;
    displayName: string;
    email: string;
    roleName: string;
    roleId: string;
    userName: string;
    appartmentBuildingId: string;
    appartmentBuildingName: string;
    phoneNumber: string;
}

export interface CreateOrUpdateUserRequestDto {
    userId: string;
    displayName: string;
    email: string;
    roleId: string;
    userName: string;
    phoneNumber: string;
    appartmentBuildingId: string;
    password: string;
}

export interface DeleteUserResponseDto {
    userIdsDeleteSuccess: string[];
    userIdsDeleteError: string[];
}

export interface LoginRequestDto {
    userName: string | null;
    password: string | null;
}

export interface TokenResponseDto {
    accessToken: string | null;
    expireTime: string;
    refreshToken: string | null;
    isActive: boolean;
}

export interface AccountInfoResponseDto {
    id: string;
    email: string;
    displayName: string;
    userName: string;
    role: string;
    apartmentBuildingId: string;
    permissions: string[];
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

