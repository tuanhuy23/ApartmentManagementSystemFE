import type { AxiosError } from "axios";
import type { ApiResponse, ErrorResponse } from "../types/apiResponse";

/**
 * Extracts error message from API error response
 * Supports error format: { error: { message: string, errorCode: string, statusCode: number } }
 * 
 * @param error - The error object (can be AxiosError, ApiResponse, or any error)
 * @param defaultMessage - Default message to return if no error message found
 * @returns The error message string
 */
export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "An error occurred"
): string => {
  // Handle AxiosError with response.data structure
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const responseData = axiosError.response?.data;
    
    if (responseData) {
      // Check for error.message (from error object in ApiResponse)
      if (responseData.error?.message) {
        return responseData.error.message;
      }
      
      // Check for direct message property
      if ("message" in responseData && typeof responseData.message === "string") {
        return responseData.message;
      }
    }
  }
  
  // Handle ApiResponse directly (when error is the response itself)
  if (error && typeof error === "object" && "error" in error) {
    const apiResponse = error as ApiResponse<unknown>;
    if (apiResponse.error?.message) {
      return apiResponse.error.message;
    }
  }
  
  // Handle ErrorResponse directly
  if (error && typeof error === "object" && "message" in error && "errorCode" in error) {
    const errorResponse = error as ErrorResponse;
    if (errorResponse.message) {
      return errorResponse.message;
    }
  }
  
  // Handle standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle error with message property
  if (error && typeof error === "object" && "message" in error) {
    const errorWithMessage = error as { message: unknown };
    if (typeof errorWithMessage.message === "string") {
      return errorWithMessage.message;
    }
  }
  
  return defaultMessage;
};

