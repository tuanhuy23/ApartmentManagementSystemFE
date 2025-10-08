export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserLoginRequest {
    email: string;
    password: string;
}
export interface UserLoginResponse {
    token: string;
    expiresTime: string;
}
