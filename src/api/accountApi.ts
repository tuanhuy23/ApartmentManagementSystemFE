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
import type { ApartmentBuildingDto } from "../types/apartmentBuilding";

export const accountApi = {
  getAccount: (): Promise<ApiResponse<AccountInfoResponseDto>> => 
    axiosClient.get("/account/account-info"),

  getCurrentApartmentBuilding: (): Promise<ApiResponse<ApartmentBuildingDto>> => 
    axiosClient.get("/account/apartment-building"),
  
  login: (credentials: LoginRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/account/login", credentials),
  
  refreshToken: (refreshToken: RefreshTokenRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/account/refresh-token", refreshToken),
  
  logout: (refreshToken: RefreshTokenRequestDto): Promise<ApiResponse<TokenResponseDto>> => 
    axiosClient.post("/account/logout", refreshToken),
  
  changePassword: (passwordData: ChangePasswordRequestDto): Promise<ApiResponse<ChangePasswordResponseDto>> => 
    axiosClient.post("/account/change-password", passwordData),
  
  logoutClient: () => {
    tokenStorage.removeToken();
    window.location.href = "/login";
  }
};