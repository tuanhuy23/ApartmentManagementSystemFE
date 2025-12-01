import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";
import type { ParkingRegistrationDto } from "../types/parking";

interface GetParkingRegistrationsParams {
  apartmentId?: string;
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const parkingApi = {
  getByApartmentId: (
    id: string,
    params?: GetParkingRegistrationsParams
  ): Promise<ApiResponse<ParkingRegistrationDto[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.apartmentId) queryParams.append("appartmentId", params.apartmentId);
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
    const url = `/${getApartmentBuildingIdFromToken() || ""}/parking-registration/${id}${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },

  create: (data: ParkingRegistrationDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/parking-registration`, data),
};

