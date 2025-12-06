import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { ApartmentDto, CreateOrUpdateApartmentDto } from "../types/apartment";
import type { ResidentDto } from "../types/resident";

interface GetApartmentsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

interface GetResidentsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const apartmentApi = {
  getAll: (params?: GetApartmentsParams): Promise<ApiResponse<ApartmentDto[]>> => {
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/apartment${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<ApartmentDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${id}`),

  create: (data: CreateOrUpdateApartmentDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/apartment`, data),

  getResidents: (apartmentId: string, params?: GetResidentsParams): Promise<ApiResponse<ResidentDto[]>> => {
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  createResident: (apartmentId: string, data: ResidentDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents`, data),

  getResidentDetail: (apartmentId: string, id: string): Promise<ApiResponse<ResidentDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents/detail/${id}`),

  update: (data: CreateOrUpdateApartmentDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/apartment`, data),

  delete: (ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/apartment`, { data: ids }),

  updateResident: (apartmentId: string, data: ResidentDto): Promise<ApiResponse<void>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents`, data),

  deleteResident: (apartmentId: string, ids: string[]): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents`, { data: ids }),
};

