import axiosClient from "./axiosClient";
import type { 
  LoginRequestDto, 
  TokenResponseDto, 
  AccountInfoResponseDto, 
  RefreshTokenRequestDto, 
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  UpdatePasswordInFirstTimeLoginRequestDto,
  UpdatePasswordInFirstTimeLoginResponseDto
} from "../types/user";
import type { ApiResponse } from "../types/apiResponse";
import { tokenStorage } from "../utils/storage";

export const accountApi = {
  getAccount: (): Promise<ApiResponse<AccountInfoResponseDto>> => 
    axiosClient.get("/api/Account/accountInfo"),
  
  login: (credentials: LoginRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/api/Account/login", credentials),
  
  refreshToken: (refreshToken: RefreshTokenRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/api/Account/refreshToken", { refreshToken }),
  
  logout: (refreshToken: RefreshTokenRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/api/Account/logout", { refreshToken }),
  
  changePassword: (passwordData: ChangePasswordRequestDto): Promise<ApiResponse<ChangePasswordResponseDto>> => 
    axiosClient.post("/api/Account/changePassword", passwordData),
  
  changePasswordInFirstTimeLogin: (passwordData: UpdatePasswordInFirstTimeLoginRequestDto): Promise<ApiResponse<UpdatePasswordInFirstTimeLoginResponseDto>> => 
    axiosClient.post("/api/Account/changePasswordInFristTimeLogin", passwordData),
  
  logoutClient: () => {
    tokenStorage.removeToken();
    window.location.href = "/login";
  }
};