
import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { useToastStore } from "../store/toastStore.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const toast = useToastStore.getState();
    const auth = useAuthStore.getState();

    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      auth.logout();
      auth.clearStorage();
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (error.message) {
      toast.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

