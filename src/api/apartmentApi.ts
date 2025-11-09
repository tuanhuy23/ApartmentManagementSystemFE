import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { ApartmentDto, CreateOrUpdateApartmentDto } from "../types/apartment";

export const apartmentApi = {
  getAll: (): Promise<ApiResponse<ApartmentDto[]>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment`),

  getById: (id: string): Promise<ApiResponse<ApartmentDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${id}`),

  create: (data: CreateOrUpdateApartmentDto): Promise<ApiResponse<ApartmentDto>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/apartment`, data),

  update: (id: string, data: CreateOrUpdateApartmentDto): Promise<ApiResponse<ApartmentDto>> =>
    axiosClient.put(`/${getApartmentBuildingIdFromToken() || ""}/apartment/${id}`, data),
};

