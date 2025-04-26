import axios from "axios";
import { encryptData, decryptData, logoutAndRedirect } from "./utils";


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});



axiosInstance.interceptors.request.use((config) => {
  if (config.data) {
    config.data = { payload: encryptData(config.data) };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data?.payload) {
      response.data = decryptData(response.data.payload);
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.payload) {
      error.response.data = decryptData(error.response.data.payload);
      if (error.response.status === 401 || error.response.status === 429) {
        // Handle token expiration or unauthorized access
        // You can redirect to login page or show a message to the user
        // console.error("Unauthorized access - Token expired or invalid.");
        logoutAndRedirect();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
