import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type {
  FeeNoticeDto,
  CreateOrUpdateFeeNoticeDto,
  UtilityReadingDto,
} from "../types/apartment";
import type { ImportFeeNoticeResult } from "../types/fee";

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
    const url = `/${appartmentBuildingId}/fee/${apartmentId}${queryString ? `?${queryString}` : ""}`;

    return axiosClient.get(url, { headers });
  },

  getById: (id: string): Promise<ApiResponse<FeeNoticeDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/fee?id=${id}`);
  },

  create: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/fee`, data);
  },

  update: (data: CreateOrUpdateFeeNoticeDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/fee`, data);
  },

  getUtilityReadings: (apartmentId: string, params?: GetUtilityReadingsParams): Promise<ApiResponse<UtilityReadingDto[]>> => {
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
    const url = `/${appartmentBuildingId}/fee/utility-reading/${apartmentId}${queryString ? `?${queryString}` : ""}`;

    return axiosClient.get(url, { headers });
  },

  delete: (ids: string[]): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.delete(`/${appartmentBuildingId}/fee`, { data: ids });
  },

  cancelFee: (id: string): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/fee/${id}/cancel-fee`);
  },

  updatePaymentStatusFee: (id: string): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.put(`/${appartmentBuildingId}/fee/${id}/update-payment-status-fee`);
  },

  downloadExcelTemplate: (): Promise<Blob> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    return axiosClient.get(`/${appartmentBuildingId}/fee/download-excel-template`, {
      responseType: 'blob',
    }) as Promise<Blob>;
  },

  import: (file: File): Promise<ApiResponse<ImportFeeNoticeResult[]>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.post(`/${appartmentBuildingId}/fee/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

