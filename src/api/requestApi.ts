import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { RequestDto, RequestHistoryDto, UpdateStatusAndAssignRequestDto, RattingRequestDto } from "../types/request";
import type { UserDto } from "../types/user";

interface GetRequestsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const requestApi = {
  getAll: (params?: GetRequestsParams): Promise<ApiResponse<RequestDto[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    const queryParams = new URLSearchParams();
    if (params?.filters && params.filters.length > 0) {
      queryParams.append("filters", JSON.stringify(params.filters));
    }
    if (params?.sorts && params.sorts.length > 0) {
      queryParams.append("sorts", JSON.stringify(params.sorts));
    }
    
    const headers: Record<string, string> = {};
    if (params?.page) {
      headers.page = params.page.toString();
    }
    if (params?.limit) {
      headers.limit = params.limit.toString();
    }
    
    const queryString = queryParams.toString();
    const url = `/${appartmentBuildingId}/request${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string, requestId?: string): Promise<ApiResponse<RequestDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    const params = requestId ? `?requestId=${requestId}` : "";
    return axiosClient.get(`/${appartmentBuildingId}/request/${id}${params}`);
  },

  create: (data: RequestDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/request`, data);
  },

  update: (data: RequestDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/request`, data);
  },

  delete: (ids: string[]): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.delete(`/${appartmentBuildingId}/request`, { data: ids });
  },

  createRequestAction: (data: RequestHistoryDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/request/request-action`, data);
  },

  updateRequestAction: (data: RequestHistoryDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/request/request-action`, data);
  },

  updateStatus: (data: UpdateStatusAndAssignRequestDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/request/status`, data);
  },

  updateRating: (data: RattingRequestDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/request/ratting`, data);
  },

  getUserHandlers: (): Promise<ApiResponse<UserDto[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/request/user-handler`);
  },
};

