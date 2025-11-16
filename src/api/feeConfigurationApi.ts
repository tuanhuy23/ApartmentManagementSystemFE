import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type {
  FeeTypeDto,
  CreateOrUpdateFeeTypeDto,
} from "../types/fee";

export const feeConfigurationApi = {
  getAll: (): Promise<ApiResponse<FeeTypeDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`),

  getById: (id: string): Promise<ApiResponse<FeeTypeDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration/${id}`),

  create: (data: CreateOrUpdateFeeTypeDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`, data),

  update: (data: CreateOrUpdateFeeTypeDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`, data),
};

