import axios from "axios";
import { tokenStorage } from "../utils/storage";
import { APP_CONFIG } from "../constants/appConfig";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || APP_CONFIG.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenPromise: Promise<string> | null = null;

axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && tokenStorage.isTokenValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        tokenStorage.removeToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (refreshTokenPromise) {
        try {
          await refreshTokenPromise;
          originalRequest.headers.Authorization = `Bearer ${tokenStorage.getToken()}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      refreshTokenPromise = (async () => {
        try {
          const refreshClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || APP_CONFIG.API_BASE_URL,
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          const response = await refreshClient.post("/account/refresh-token", { refreshToken });    
          if (response.data?.data) {
            tokenStorage.setToken(
              response.data.data.accessToken,
              response.data.data.refreshToken,
            );
            return response.data.data.accessToken;
          } else {
            throw new Error("Invalid refresh token response");
          }
        } catch (refreshError) {
          tokenStorage.removeToken();
          window.location.href = "/login";
          throw refreshError;
        } finally {
          refreshTokenPromise = null;
        }
      })();

      try {
        const newAccessToken = await refreshTokenPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;