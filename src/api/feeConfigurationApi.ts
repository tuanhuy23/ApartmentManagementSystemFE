import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type {
  FeeTypeDto,
  CreateOrUpdateFeeTypeDto,
} from "../types/fee";

interface GetFeeConfigurationsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const feeConfigurationApi = {
  getAll: (params?: GetFeeConfigurationsParams): Promise<ApiResponse<FeeTypeDto[]>> => {
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/fee-configuration${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<FeeTypeDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration/${id}`),

  create: (data: CreateOrUpdateFeeTypeDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`, data),

  update: (data: CreateOrUpdateFeeTypeDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`, data),

  delete: (ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/fee-configuration`, { data: ids }),
};

