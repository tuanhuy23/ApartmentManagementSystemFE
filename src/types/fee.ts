export type CalculationType = "AREA" | "QUANTITY" | "TIERED";

export interface FeeTypeDto {
  id: string;
  name: string;
  calculationType: string;
  apartmentBuildingId: string;
  isVATApplicable: boolean;
  isActive: boolean;
  defaultRate: number;
  defaultVATRate: number;
  applyDate: string | null;
  feeRateConfigs: FeeRateConfigDto[];
  quantityRateConfigs: QuantityRateConfigDto[];
}

export interface FeeRateConfigDto {
  id: string;
  apartmentBuildingId: string;
  feeTypeId: string;
  vatRate: number;
  isActive: boolean;
  applyDate: string;
  name: string;
  unitName: string;
  otherRate: number | null;
  feeTiers: FeeTierDto[];
}

export interface FeeTierDto {
  id: string;
  feeRateConfigId: string;
  tierOrder: number;
  consumptionStart: number;
  consumptionEnd: number;
  unitRate: number;
  unitName: string;
}

export interface CreateOrUpdateFeeTypeDto {
  id: string | null;
  name: string;
  calculationType: string;
  apartmentBuildingId: string;
  isVATApplicable: boolean;
  defaultRate: number;
  defaultVATRate: number;
  isActive: boolean;
  applyDate: string | null;
  feeRateConfigs: CreateOrUpdateFeeRateConfigDto[];
  quantityRateConfigs: CreateOrUpdateQuantityRateConfigDto[];
}

export interface CreateOrUpdateFeeRateConfigDto {
  id: string | null;
  name: string;
  vatRate: number;
  isActive: boolean;
  applyDate: string;
  unitName: string;
  otherRate: number | null;
  feeTiers: CreateOrUpdateFeeRateTierDto[];
}

export interface CreateOrUpdateFeeRateTierDto {
  id: string | null;
  tierOrder: number;
  consumptionStart: number;
  consumptionEnd: number;
  unitRate: number;
}

export interface QuantityRateConfigDto {
  id: string;
  apartmentBuildingId: string;
  feeTypeId: string;
  isActive: boolean;
  itemType: string;
  unitRate: number;
}

export interface CreateOrUpdateQuantityRateConfigDto {
  id: string | null;
  isActive: boolean;
  itemType: string;
  unitRate: number;
}

export interface FeeType {
  id: string;
  feeName: string;
  calculationType: CalculationType;
  buildingId: string;
  buildingName: string;
  isActive?: boolean;
  isVATApplicable?: boolean;
  defaultRate?: number;
  vatRate?: number;
  applyDate?: string | null;
  quantityRates?: QuantityRate[];
  rateConfigs?: FeeRateConfig[];
}

export interface QuantityRate {
  id: string;
  itemType: string;
  unitRate: number;
  vatRate: number;
}

export interface FeeRateConfig {
  id: string;
  configName: string;
  vatRate: number;
  bvmtFee: number;
  unitName?: string;
  applyDate?: string;
  status: "ACTIVE" | "INACTIVE";
  tiers?: FeeTier[];
}

export interface FeeTier {
  id: string;
  tier: number;
  from: number;
  to: number;
  rate: number;
}
