import axiosClient from "./axiosClient";
import type { LoginRequestDto, UserLoginResponse, AccountInfo, RefreshTokenRequest, RefreshTokenResponse } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";
import { tokenStorage } from "../utils/storage";


export const accountApi = {
  getAccount: (): Promise<ApiResponse<AccountInfo>> => axiosClient.get("/api/Account/accountInfo"),
  login: (credentials: LoginRequestDto): Promise<ApiResponse<UserLoginResponse>> => 
    axiosClient.post("/api/Account/login", credentials),
  
  refreshToken: (refreshToken: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => 
    axiosClient.post("/api/Account/refreshToken", { refreshToken }),
  
  logout: () => {
    tokenStorage.removeToken();
    window.location.href = "/login";
  }
};