import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { ApartmentDto, CreateOrUpdateApartmentDto } from "../types/apartment";
import type { ResidentDto } from "../types/resident";

export const apartmentApi = {
  getAll: (): Promise<ApiResponse<ApartmentDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment`),

  getById: (id: string): Promise<ApiResponse<ApartmentDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${id}`),

  create: (data: CreateOrUpdateApartmentDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/apartment`, data),

  getResidents: (apartmentId: string): Promise<ApiResponse<ResidentDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents`),

  createResident: (apartmentId: string, data: ResidentDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents`, data),

  getResidentDetail: (apartmentId: string, id: string): Promise<ApiResponse<ResidentDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${apartmentId}/residents/detail/${id}`),
};

