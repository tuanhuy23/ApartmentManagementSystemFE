import axiosClient from "./axiosClient";
import type { LoginRequestDto, UserLoginResponse, AccountInfo } from "../types/user";
import type { ApiResponse } from "../types/apiResponse";
import { tokenStorage } from "../utils/storage";


export const accountApi = {
  getAccount: (): Promise<ApiResponse<AccountInfo>> => axiosClient.get("/api/Account"),
  login: (credentials: LoginRequestDto): Promise<ApiResponse<UserLoginResponse>> => 
    axiosClient.post("/api/Account", credentials),
  
  logout: () => {
    tokenStorage.removeToken();
    window.location.href = "/login";
  }
};