import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5050/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Intercepteur pour ajouter automatiquement le token JWT si présent
axiosInstance.interceptors.request.use(
  (config) => {
    // Support both localStorage (legacy) and sessionStorage (current) tokens
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("accessToken");
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
