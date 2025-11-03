import type { Dayjs } from "dayjs";

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
  status: 'DRAFT' | 'ISSUED';
  paymentStatus: 'N/A' | 'UNPAID' | 'PAID';
}

export interface UtilityReading {
  id: string;
  type: 'Electricity' | 'Water';
  readingDate: string;
  readingValue: number;
  consumption: number;
  unit: string;
}

export interface FeeType {
  id: string;
  name: string;
  type: 'TIERED' | 'QUANTITY' | 'SERVICE';
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

