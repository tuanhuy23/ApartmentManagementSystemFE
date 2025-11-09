export type CalculationType = "AREA" | "QUANTITY" | "TIERED";

export interface FeeTypeDto {
  id: string;
  name: string;
  calculationType: string;
  apartmentBuildingId: string;
  isVATApplicable: boolean;
  isActive: boolean;
  defaultRate: number;
  feeRateConfigs: FeeRateConfigDto[];
  quantityRateConfigs?: CreateOrUpdateQuantityRateConfigDto[];
}

export interface FeeRateConfigDto {
  id: string;
  apartmentBuildingId: string;
  feeTypeId: string;
  vatRate: number;
  isActive: boolean;
  name: string;
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
  feeRateConfigs: CreateOrUpdateFeeRateConfigDto[];
  quantityRateConfigs: CreateOrUpdateQuantityRateConfigDto[];
}

export interface CreateOrUpdateFeeRateConfigDto {
  id: string | null;
  name: string;
  vatRate: number;
  isActive: boolean;
  feeTiers: CreateOrUpdateFeeRateTierDto[];
}

export interface CreateOrUpdateFeeRateTierDto {
  id: string | null;
  tierOrder: number;
  consumptionStart: number;
  consumptionEnd: number;
  unitRate: number;
  unitName: string;
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
