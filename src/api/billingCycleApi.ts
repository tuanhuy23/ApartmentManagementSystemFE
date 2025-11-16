import axiosClient from "./axiosClient";
import { getApartmentBuildingIdFromToken } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { BillingCycleSettingDto } from "../types/billingCycle";

export const billingCycleApi = {
  get: (): Promise<ApiResponse<BillingCycleSettingDto>> =>
    axiosClient.get(`/${getApartmentBuildingIdFromToken() || ""}/billing-cycle-setting`),

  create: (data: BillingCycleSettingDto): Promise<ApiResponse<void>> =>
    axiosClient.post(`/${getApartmentBuildingIdFromToken() || ""}/billing-cycle-setting`, data),
};

