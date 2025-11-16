import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { RequestDto } from "../types/request";
import type { FeedbackDto } from "../types/feedback";

export const requestApi = {
  getAll: (): Promise<ApiResponse<RequestDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/request`),

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
};

