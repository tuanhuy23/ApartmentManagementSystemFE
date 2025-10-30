import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { UploadFileData } from "../types/file";

export const fileApi = {
  upload: (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post<ApiResponse<UploadFileData>>(`/${getApartmentBuildingIdFromToken() || ""}/File/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      const data = response as unknown as ApiResponse<UploadFileData>;
      return data.data.url;
    });
  },
};
