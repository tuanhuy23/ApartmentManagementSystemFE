import axiosClient from "./axiosClient";
import type { 
  ApartmentBuildingDto, 
  CreateApartmentBuildingDto 
} from "../types/apartmentBuilding";
import type { ApiResponse } from "../types/apiResponse";

export const apartmentBuildingApi = {
  getApartmentBuildings: (): Promise<ApiResponse<ApartmentBuildingDto[]>> => 
    axiosClient.get(`/apartment-building`),
  
  createApartmentBuilding: (data: CreateApartmentBuildingDto): Promise<ApiResponse<void>> => 
    axiosClient.post(`/apartment-building`, data),
};
