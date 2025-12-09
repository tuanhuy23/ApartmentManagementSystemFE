import type { Dayjs } from "dayjs";

export interface ApartmentDto {
  id: string;
  apartmentBuildingId: string;
  area: number;
  name: string;
  floor: number;
}

export interface CreateOrUpdateApartmentDto {
  id: string | null;
  apartmentBuildingId: string;
  area: number;
  name: string;
  floor: number;
}

export interface UpdateApartmentDto {
  id: string;
  area: number;
  name: string;
  floor: number;
}

export interface FeeNoticeDto {
  id: string;
  apartmentId: string;
  apartmentBuildingId: string;
  billingCycle: string;
  status: string;
  paymentStatus: string;
  issueDate: string;
  totalAmount: number;
  dueDate: string;
  feeDetails: FeeDetailDto[];
}

export interface FeeDetailDto {
  feeNoticeId: string;
  feeTypeId: string;
  consumption: number | null;
  subTotal: number;
  grossCost: number;
  vatRate: number;
  vatCost: number;
  previousReadingDate: string | null;
  previousReading: number | null;
  currentReadingDate: string | null;
  currentReading: number | null;
  utilityCurentReadingId: string | null;
  proration: number | null;
  feeTierDetails: FeeTierDetail[] | null;
}

export interface FeeTierDetail {
  tierOrder: number;
  consumptionStart: number;
  consumptionEnd: number;
  consumptionStartOriginal: number;
  consumptionEndOriginal: number;
  unitRate: number;
  unitName: string;
  consumption: number;
}

export interface CreateOrUpdateFeeNoticeDto {
  id: string | null;
  apartmentId: string;
  apartmentBuildingId: string;
  billingCycle: string;
  feeTypeIds: string[];
  feeDetails: CreateOrUpdateFeeDetailDto[];
}

export interface CreateOrUpdateFeeDetailDto {
  apartmentId: string;
  feeTypeId: string;
  utilityReading: CreateUtilityReadingDto;
}

export interface CreateUtilityReadingDto {
  utilityCurentReadingId: string | null;
  currentReading: number;
  readingDate: string;
}

export interface UtilityReadingDto {
  id: string;
  apartmentId: string;
  feeTypeId: string;
  feeTypeName: string;
  currentReading: number;
  readingDate: string;
}

export interface Apartment {
  id: string;
  code: string;
  area: number;
  buildingName: string;
  registeredVehicles: {
    total: number;
    cars: number;
    motorbikes: number;
  };
  closingDate: number;
  managerName: string;
}

export interface FeeNotice {
  id: string;
  cycle: string;
  totalAmount: number;
  status: "DRAFT" | "ISSUED";
  paymentStatus: "N/A" | "UNPAID" | "PAID";
}

export interface UtilityReading {
  id: string;
  type: "Electricity" | "Water";
  readingDate: string;
  readingValue: number;
  consumption: number;
  unit: string;
}

export interface FeeType {
  id: string;
  name: string;
  type: "TIERED" | "QUANTITY" | "SERVICE";
}

export interface InvoiceFormData {
  cycle: string;
  selectedFees: string[];
  electricity: {
    newReadingDate: Dayjs;
    newReading: number;
    oldReading: number;
    oldDate: string;
  };
  water: {
    newReadingDate: Dayjs;
    newReading: number;
    oldReading: number;
    oldDate: string;
  };
  parking: {
    adjustedQuantity: number;
  };
}
