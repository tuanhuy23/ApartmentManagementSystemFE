import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { RequestDto } from "../types/request";
import type { FeedbackDto } from "../types/feedback";

interface GetRequestsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const requestApi = {
  getAll: (params?: GetRequestsParams): Promise<ApiResponse<RequestDto[]>> => {
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/request${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string, requestId?: string): Promise<ApiResponse<RequestDto>> => {
    const params = requestId ? `?requestId=${requestId}` : "";
    return axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/request/${id}${params}`);
  },

  create: (data: RequestDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/request`, data),

  update: (data: RequestDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/request`, data),

  createFeedback: (data: FeedbackDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/request/feedback`, data),

  updateFeedback: (data: FeedbackDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/request/feedback`, data),

  delete: (ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/request`, { data: ids }),

  deleteFeedback: (ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/request/feedback`, { data: ids }),
};

