import axios from "axios";
import { tokenStorage } from "../utils/storage";
import { APP_CONFIG } from "../constants/appConfig";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || APP_CONFIG.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.removeToken();
      window.location.href = "/login";
    }
    throw error;
  }
);

export default axiosClient;