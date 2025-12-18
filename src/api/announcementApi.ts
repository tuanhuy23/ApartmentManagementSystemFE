import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { AnnouncementDto, ApartmentAnnouncementDto } from "../types/announcement";

interface GetAnnouncementsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const announcementApi = {
  getAll: (params?: GetAnnouncementsParams): Promise<ApiResponse<AnnouncementDto[]>> => {
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
    const url = `/${appartmentBuildingId}/announcement${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<AnnouncementDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/announcement/${id}`);
  },

  create: (data: AnnouncementDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/announcement`, data);
  },

  update: (data: AnnouncementDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/announcement`, data);
  },

  delete: (ids: string[]): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.delete(`/${appartmentBuildingId}/announcement`, { data: ids });
  },

  downloadExcelTemplate: (): Promise<Blob> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    return axiosClient.get(`/${appartmentBuildingId}/announcement/download-excel-template`, {
      responseType: "blob",
    }) as Promise<Blob>;
  },

  importApartment: (file: File): Promise<ApiResponse<ApartmentAnnouncementDto[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post(`/${appartmentBuildingId}/announcement/import-aparment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getApartment: (): Promise<ApiResponse<ApartmentAnnouncementDto[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    return axiosClient.get(`/${appartmentBuildingId}/announcement/apartments`);
  },
};

