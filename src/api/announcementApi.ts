import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { AnnouncementDto } from "../types/announcement";

export const announcementApi = {
  getAll: (): Promise<ApiResponse<AnnouncementDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/announcement`),

  getById: (id: string, requestId?: string): Promise<ApiResponse<AnnouncementDto>> => {
    const params = requestId ? `?requestId=${requestId}` : "";
    return axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/announcement/${id}${params}`);
  },

  create: (data: AnnouncementDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/announcement`, data),

  update: (data: AnnouncementDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/announcement`, data),
};

