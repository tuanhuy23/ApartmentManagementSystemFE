import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { ImageDto } from "../types/file";

export const fileApi = {
  upload: (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post<ApiResponse<ImageDto>>(`/${getApartmentBuildingIdFromToken() || ""}/file/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      return (response as any)?.data?.url || (response as any)?.url || "";
    });
  },
};
