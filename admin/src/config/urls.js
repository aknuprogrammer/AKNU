import axios from "axios";

const MAIN_URL = "https://backend.dev.aknu.edu.in/api"; // no trailing '/'
// const MAIN_URL = "https://api.aknu.edu.in/api"; //production
const LOCAL_URL = "http://localhost:4567/api"; // no trailing '/'
const IP_URL = "http://192.168.0.2:4567/api"; // no trailing '/'
const BASE_URL = LOCAL_URL;

export const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.error(
        `[AUTH] Unauthorized (401) on ${error.config.url}:`,
        error.response.data,
      );
      console.warn("[AUTH] Clearing session and redirecting to login...");

      // Clear token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("isAuthenticated");

      // Show error message
      if (error.response.data && error.response.data.message) {
        console.error("Authentication error:", error.response.data.message);
      }

      // Redirect to login page
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login-page") {
        window.location.href = "/login-page";
      }
    }

    return Promise.reject(error);
  },
);

export { BASE_URL };
