export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequestDto {
    userName: string | null;
    password: string | null;
}

export interface UserLoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AccountInfo {
    id: string;
    userName: string;
    displayName: string;
    email: string;
    roles: string;
    permissions: string[];
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}