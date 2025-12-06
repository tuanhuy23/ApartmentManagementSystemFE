import type { AxiosError } from "axios";
import type { ApiResponse, ErrorResponse } from "../types/apiResponse";

export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "An error occurred"
): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const responseData = axiosError.response?.data;
    
    if (responseData) {
      if (responseData.error?.message) {
        return responseData.error.message;
      }
      
      if ("message" in responseData && typeof responseData.message === "string") {
        return responseData.message;
      }
    }
  }
  
  if (error && typeof error === "object" && "error" in error) {
    const apiResponse = error as ApiResponse<unknown>;
    if (apiResponse.error?.message) {
      return apiResponse.error.message;
    }
  }
  
  if (error && typeof error === "object" && "message" in error && "errorCode" in error) {
    const errorResponse = error as ErrorResponse;
    if (errorResponse.message) {
      return errorResponse.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    const errorWithMessage = error as { message: unknown };
    if (typeof errorWithMessage.message === "string") {
      return errorWithMessage.message;
    }
  }
  
  return defaultMessage;
};

