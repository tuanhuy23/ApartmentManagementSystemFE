export type CalculationType = "AREA" | "QUANTITY" | "TIERED";

export interface FeeType {
  id: string;
  feeName: string;
  calculationType: CalculationType;
  buildingId: string;
  buildingName: string;
  defaultRate?: number; // For AREA type
  vatRate?: number; // For AREA type
  quantityRates?: QuantityRate[]; // For QUANTITY type
  rateConfigs?: FeeRateConfig[]; // For TIERED type
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

