import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export default axiosClient;