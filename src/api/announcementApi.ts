import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { AnnouncementDto } from "../types/announcement";

interface GetAnnouncementsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const announcementApi = {
  getAll: (params?: GetAnnouncementsParams): Promise<ApiResponse<AnnouncementDto[]>> => {
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/announcement${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<AnnouncementDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/announcement/${id}`),

  create: (data: AnnouncementDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/announcement`, data),

  update: (data: AnnouncementDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/announcement`, data),

  delete: (ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/announcement`, { data: ids }),
};

