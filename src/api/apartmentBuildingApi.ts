import axiosClient from "./axiosClient";
import type { 
  ApartmentBuildingDto, 
  CreateApartmentBuildingDto 
} from "../types/apartmentBuilding";
import type { ApiResponse, FilterQuery, SortQuery } from "../types/apiResponse";

interface GetApartmentBuildingsParams {
  filters?: FilterQuery[];
  sorts?: SortQuery[];
  page?: number;
  limit?: number;
}

export const apartmentBuildingApi = {
  getApartmentBuildings: (params?: GetApartmentBuildingsParams): Promise<ApiResponse<ApartmentBuildingDto[]>> => {
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
    const url = `/apartment-building${queryString ? `?${queryString}` : ""}`;
    
    return axiosClient.get(url, { headers });
  },
  
  createApartmentBuilding: (data: CreateApartmentBuildingDto): Promise<ApiResponse<void>> => 
    axiosClient.post(`/apartment-building`, data),
};
