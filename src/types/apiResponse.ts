export interface MetaData {
  page: number;
  perPage: number;
  total: number;
  sort: string | null;
}

export interface ErrorResponse {
  errorCode: string | null;
  message: string | null;
  statusCode: number;
}

export interface ApiResponse<T> {
  status: number;
  metadata: MetaData;
  error: ErrorResponse;
  data: T;
}

export interface Pagination extends MetaData {
  limit: number;
}

export const SortDirection = {
  Ascending: "Ascending",
  Descending: "Descending",
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];

export interface SortQuery {
  Code: string;
  Direction: SortDirection;
}

export const FilterOperator = {
  Equals: "Equals",
  In: "In",
  NotEquals: "NotEquals",
  GreaterThan: "GreaterThan",
  GreaterThanOrEqual: "GreaterThanOrEqual",
  LessThan: "LessThan",
  LessThanOrEqual: "LessThanOrEqual",
  Contains: "Contains",
  StartsWith: "StartsWith",
  EndsWith: "EndsWith",
} as const;

export type FilterOperator = typeof FilterOperator[keyof typeof FilterOperator];

export interface FilterQuery {
  Code: string;
  Operator: FilterOperator;
  Value: any;
}