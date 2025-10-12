export interface ApiResponse<T> {
  data: T;
  metadata: T;
  status: number;
  error: ErrorResponse;
}
  
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  statusCode: number;
}