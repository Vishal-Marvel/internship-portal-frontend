import axios from "axios";

const axiosInstance = axios.create({
  // url: "https://internship-portal-backend.vercel.app/internship/api/v1",
  baseURL: "https://internship-portal-backend.vercel.app/internship/api/v1",
  // baseURL: "http://localhost:3000/internship/api/v1",
});

export default axiosInstance;
