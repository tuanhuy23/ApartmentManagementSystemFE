import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type {
  FeeNoticeDto,
  CreateOrUpdateFeeNoticeDto,
  UtilityReadingDto,
} from "../types/apartment";

export const feeApi = {
  getByApartmentId: (apartmentId: string): Promise<ApiResponse<FeeNoticeDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee/${apartmentId}`),

  getById: (id: string): Promise<ApiResponse<FeeNoticeDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee?id=${id}`),

  create: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/fee`, data),

  update: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/fee`, data),

  getUtilityReadings: (apartmentId: string): Promise<ApiResponse<UtilityReadingDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee/utility-reading/${apartmentId}`),
};

