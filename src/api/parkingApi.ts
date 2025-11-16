import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { ParkingRegistrationDto } from "../types/parking";

export const parkingApi = {
  getByApartmentId: (
    id: string,
    apartmentId?: string
  ): Promise<ApiResponse<ParkingRegistrationDto[]>> => {
    const params = apartmentId ? `?appartmentId=${apartmentId}` : "";
    return axiosClient.get(
      `/${getApartmentBuildingIdFromToken() || ""}/parking-registration/${id}${params}`
    );
  },

  create: (data: ParkingRegistrationDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/parking-registration`, data),
};

