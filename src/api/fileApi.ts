import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { ImageDto } from "../types/file";

export const fileApi = {
  upload: (file: File): Promise<string> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }

    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post<ApiResponse<ImageDto>>(`/${appartmentBuildingId}/file/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      return (response as any)?.data?.url || (response as any)?.url || "";
    });
  },
};
