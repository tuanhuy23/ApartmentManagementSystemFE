import axiosClient from "./axiosClient";
import type { 
  LoginRequestDto, 
  TokenResponseDto, 
  AccountInfoResponseDto, 
  RefreshTokenRequestDto, 
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
} from "../types/user";
import type { ApiResponse } from "../types/apiResponse";
import { tokenStorage } from "../utils/storage";

export const accountApi = {
  getAccount: (): Promise<ApiResponse<AccountInfoResponseDto>> => 
    axiosClient.get("/Account/accountInfo"),
  
  login: (credentials: LoginRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/Account/login", credentials),
  
  refreshToken: (refreshToken: RefreshTokenRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/Account/refreshToken", { refreshToken }),
  
  logout: (refreshToken: string): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/Account/logout", { refreshToken }),
  
  changePassword: (passwordData: ChangePasswordRequestDto): Promise<ApiResponse<ChangePasswordResponseDto>> => 
    axiosClient.post("/Account/changePassword", passwordData),
  
  logoutClient: () => {
    tokenStorage.removeToken();
    window.location.href = "/login";
  }
};