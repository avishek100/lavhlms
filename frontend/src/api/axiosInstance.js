import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const axiosInstance = axios.create({ baseURL });

export const publicAxiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use(
  (config) => {
    const storedToken = sessionStorage.getItem("accessToken");
    let accessToken = "";

    if (storedToken) {
      try {
        accessToken = JSON.parse(storedToken);
      } catch {
        accessToken = storedToken;
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;
