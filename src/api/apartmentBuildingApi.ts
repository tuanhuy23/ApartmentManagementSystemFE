import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { 
  ApartmentBuildingDto, 
  CreateApartmentBuildingDto 
} from "../types/apartmentBuilding";
import type { ApiResponse } from "../types/apiResponse";

export const apartmentBuildingApi = {
  getApartmentBuildings: (): Promise<ApiResponse<ApartmentBuildingDto[]>> => 
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/ApartmentBuilding`),
  
  createApartmentBuilding: (data: CreateApartmentBuildingDto): Promise<ApiResponse<ApartmentBuildingDto>> => 
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/ApartmentBuilding`, data),
};
