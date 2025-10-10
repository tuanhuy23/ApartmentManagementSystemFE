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
    expireTime: string;
    refreshToken: string;
}

export interface AccountInfo {
    id: number;
    userName: string;
    email: string;
    roles?: string[];
}
