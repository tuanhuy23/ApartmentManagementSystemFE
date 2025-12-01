import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type {
  FeeNoticeDto,
  CreateOrUpdateFeeNoticeDto,
  UtilityReadingDto,
} from "../types/apartment";

interface GetFeesByApartmentParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

interface GetUtilityReadingsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const feeApi = {
  getByApartmentId: (apartmentId: string, params?: GetFeesByApartmentParams): Promise<ApiResponse<FeeNoticeDto[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.filters && params.filters.length > 0) {
      queryParams.append("filters", JSON.stringify(params.filters));
    }
    if (params?.sorts && params.sorts.length > 0) {
      queryParams.append("sorts", JSON.stringify(params.sorts));
    }
    
    const headers: Record<string, string> = {};
    headers.page = (params?.page ?? 1).toString();
    headers.limit = (params?.limit ?? 20).toString();
    
    const queryString = queryParams.toString();
    const url = `/${getApartmentBuildingIdFromToken() || ""}/fee/${apartmentId}${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<FeeNoticeDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee?id=${id}`),

  create: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/fee`, data),

  update: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/fee`, data),

  getUtilityReadings: (apartmentId: string, params?: GetUtilityReadingsParams): Promise<ApiResponse<UtilityReadingDto[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.filters && params.filters.length > 0) {
      queryParams.append("filters", JSON.stringify(params.filters));
    }
    if (params?.sorts && params.sorts.length > 0) {
      queryParams.append("sorts", JSON.stringify(params.sorts));
    }
    
    const headers: Record<string, string> = {};
    headers.page = (params?.page ?? 1).toString();
    headers.limit = (params?.limit ?? 20).toString();
    
    const queryString = queryParams.toString();
    const url = `/${getApartmentBuildingIdFromToken() || ""}/fee/utility-reading/${apartmentId}${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },
};

