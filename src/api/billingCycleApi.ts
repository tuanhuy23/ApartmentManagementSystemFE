import axiosClient from "./axiosClient";
import { getAppartmentBuildingId } from "../utils/token";
import type { ApiResponse } from "../types/apiResponse";
import type { BillingCycleSettingDto } from "../types/billingCycle";

export const billingCycleApi = {
  get: (): Promise<ApiResponse<BillingCycleSettingDto>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.get(`/${appartmentBuildingId}/billing-cycle-setting`);
  },

  create: (data: BillingCycleSettingDto): Promise<ApiResponse<void>> => {
    const appartmentBuildingId = getAppartmentBuildingId();
    if (!appartmentBuildingId) {
      return Promise.reject(new Error("AppartmentBuildingId is required"));
    }
    return axiosClient.post(`/${appartmentBuildingId}/billing-cycle-setting`, data);
  },
};

