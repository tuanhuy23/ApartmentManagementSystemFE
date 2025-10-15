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